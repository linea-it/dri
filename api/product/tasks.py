from __future__ import absolute_import, unicode_literals

from smtplib import SMTPException

from celery import task
from celery.task.schedules import crontab
from celery.decorators import periodic_task
from celery import group
from product.descutoutservice import DesCutoutService, CutoutJobNotify
import math
from django.utils import timezone
import os
import shutil
from common.download import Download
from django.core.mail import EmailMessage

descutout = DesCutoutService()
cutoutJobNotify = CutoutJobNotify()

@task(name="start_des_cutout_job_by_id")
def start_des_cutout_job_by_id(cutoutjob_id):
    """
        Esta Task vai instanciar a Classe DesCutoutService,
        executar o methodo start_job_by_id
        esse job vai enviar o job para o servico do des.

        :param cutoutjob_id: Chave pk do model product.CutOutModel
    """
    descutout.start_job_by_id(int(cutoutjob_id))


@periodic_task(
    # run_every=(crontab(minute='*/1')),
    run_every=(crontab(minute='*/%s' % descutout.check_jobs_task_delay)),
    # run_every=10.0,
    name="check_jobs_running",
    ignore_result=True
)
def check_jobs_running():
    """
        Recupera todos os cutoutjobs com status Running
        e verifica no servico DESCutout o status do job
        e os marca com status
    """
    descutout.check_jobs()


@task(name="download_cutoutjob")
def download_cutoutjob(id):
    logger = descutout.logger

    logger.info("Start downloading Cutout Job [ %s ]" % id)

    cutoutjob = descutout.get_cutoutjobs_by_id(id)

    # Changing the CutoutJob Status for Downloading
    descutout.change_cutoutjob_status(cutoutjob, "dw")

    cutoutdir = descutout.get_cutout_dir(cutoutjob)

    allarqs = list()

    # Deixar na memoria a lista de objetos ja associada com os nomes dos arquivos
    objects = descutout.get_objects_from_file(cutoutjob)

    # Recuperar o arquivo de Results
    with open(cutoutjob.cjb_results_file, 'r') as result_file:
        lines = result_file.readlines()
        for url in lines:
            arq = descutout.parse_result_url(url)

            # TODO adicionar um parametro para decidir se baixa somente os arquivos pngs.
            if arq.get('file_type') == 'png':
                allarqs.append(arq)

                object_id = None
                object_ra = None
                object_dec = None
                file_size = None
                finish = None

                logger.info("Downloading [ %s ]" % arq.get('filename'))

                for obj in objects:
                    if arq.get("thumbname") == obj.get("thumbname"):
                        object_id = obj.get("id")
                        object_ra = obj.get("ra")
                        object_dec = obj.get("dec")

                start = timezone.now()
                file_path = Download().download_file_from_url(
                    arq.get('url'),
                    cutoutdir,
                    arq.get('filename'),
                    ignore_errors=True
                )

                if file_path is not None:
                    file_size = os.path.getsize(file_path)
                    finish = timezone.now()

                cutout = descutout.create_cutout_model(
                    cutoutjob,
                    filename=arq.get('filename'),
                    thumbname=arq.get('thumbname'),
                    type=arq.get('file_type'),
                    filter=None,
                    object_id=object_id,
                    object_ra=object_ra,
                    object_dec=object_dec,
                    file_path=file_path,
                    file_size=file_size,
                    start=start,
                    finish=finish)

    result_file.close()

    # Deletar o job no Servico
    descutout.delete_job(cutoutjob)

    # Changing the CutoutJob Status for Done
    descutout.change_cutoutjob_status(cutoutjob, "ok")


@task(name="purge_cutoutjob_dir")
def purge_cutoutjob_dir(cutoutjob_id, product=None):
    """
        :param cutoutjob_id: Chave pk do model product.CutOutModel
    """
    logger = descutout.logger

    logger.info("Purge a Cutout Job [ %s ]" % cutoutjob_id)

    cutoutjob = None

    try:
        if product is None:
            cutoutjob = descutout.get_cutoutjobs_by_id(cutoutjob_id)
            cutout_dir = descutout.get_cutout_dir(cutoutjob)

        else:
            cutout_dir = descutout.get_cutout_dir(product=product, jobid=cutoutjob_id)

        logger.debug(cutout_dir)

        shutil.rmtree(cutout_dir)
        # shutil.rmtree(cutout_dir, ignore_errors=True)

        logger.info("Removed Dir [ %s ]" % cutout_dir)

        logger.info("Deleting a Cutout Job [ %s ]" % cutoutjob_id)

        if cutoutjob is not None:
            cutoutjob.delete()

        logger.info("Purge Done!")

    except Exception as e:
        raise e

@task(name="notify_user_by_email")
def notify_user_by_email(cutoutjob_id):
    print("Notify user ")
    logger = descutout.logger

    logger.info("Notify user about Cutout Job [ %s ]" % cutoutjob_id)

    cutoutjob = descutout.get_cutoutjobs_by_id(cutoutjob_id)

    user = cutoutjob.owner
    logger.debug("User: %s" % user.username)

    try:

        # Dados da Mensagem
        from_email = "glauber.vila.verde@gmail.com"
        to_email = "glauber.vila.verde@gmail.com"
        subject = "Mosaic Finish"

        message = cutoutJobNotify.create_email_message(cutoutjob)

        msg = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=[to_email],
            # headers={'Message-ID': 'foo'},
        )
        msg.content_subtype = "html"
        msg.send(fail_silently=False)

        logger.info("Notification send successfull")

    except SMTPException as e:
        logger.error(e)


# @task(name="download_files")
# def download_files(arq, dir):
#     logger = descutout.logger
#     import time
#     import random
#     # for arq in arqs:
#     logger.debug("Iniciando task [ %s ] " % arq['id'])
#     # logger.debug("Download Group [ %s ] File: %s" % (group_id, arq.get('filename')))
#
#     time.sleep(random.randint(1,10))
#
#     logger.debug("Terminada task [ %s ] " % arq['id'])
#         # descutout.download_file(
#         #     arq.get('url'),
#         #     dir,
#         #     arq.get('filename')
#         # )
#
# @task(name="test_callback")
# def test_callback():
#     print("TESTE CALLBACK")

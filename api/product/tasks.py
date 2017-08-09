from __future__ import absolute_import, unicode_literals

import os
import shutil
from smtplib import SMTPException

from celery import task
from celery import shared_task
from celery.decorators import periodic_task
from celery.task.schedules import crontab
from common.download import Download
from django.utils import timezone
from product.descutoutservice import DesCutoutService, CutoutJobNotify
from product.saveas import SaveAs

descutout = DesCutoutService()
cutoutJobNotify = CutoutJobNotify()
saveas = SaveAs()

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

    # Adicionar o tempo de termino
    cutoutjob.cjb_finish_time = timezone.now()
    cutoutjob.save()

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
    logger = descutout.logger

    logger.info("Notify user about Cutout Job [ %s ]" % cutoutjob_id)

    cutoutjob = descutout.get_cutoutjobs_by_id(cutoutjob_id)

    user = cutoutjob.owner
    logger.debug("User: %s" % user.username)

    try:
        cutoutJobNotify.create_email_message(cutoutjob)


    except SMTPException as e:
        logger.error(e)

# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Product Save As Tasks %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@task(name="product_save_as")
@shared_task
def product_save_as(user_id, product_id, name, filter_id=None, description=None):
    logger = saveas.logger

    logger.info("Task product_save_as Started")

    logger.debug("User: %s" % user_id)
    logger.debug("Product: %s" % product_id)
    logger.debug("Name: %s" % name)
    logger.debug("Filter: %s" % filter_id)
    logger.debug("Description: %s" % description)

    # AS TASKS DE CRIAR E REGISTRAR DEVEM SER SEQUENCIAS

    # TODO: Notificar inicio

    # Criar a tabela
    saveas.create_table_by_product_id(user_id, product_id, name, filter_id, description)






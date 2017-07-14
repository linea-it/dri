from __future__ import absolute_import, unicode_literals
from celery import task
from celery.task.schedules import crontab
from celery.decorators import periodic_task
from celery import group
from product.descutoutservice import DesCutoutService
import math
from django.utils import timezone

descutout = DesCutoutService()
import os


@task(name="start_des_cutout_job_by_id")
def start_des_cutout_job_by_id(id):
    """
        Esta Task vai instanciar a Classe DesCutoutService,
        executar o methodo start_job_by_id
        esse job vai enviar o job para o servico do des.

        :param id: Chave pk do model product.CutOutModel
    """
    descutout.start_job_by_id(int(id))


@periodic_task(
    run_every=(crontab(minute='*/1')),
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


@periodic_task(
    # run_every=(crontab(minute='*/1')),
    run_every=30.0,
    name="check_jobs_to_be_downloaded",
    # ignore_result=True
)
def check_jobs_to_be_downloaded():
    logger = descutout.logger

    # Recuperar todos os jobs com status Before Downloading
    cutoutjobs = descutout.get_cutoutjobs_by_status('bd')

    if cutoutjobs.count() > 0:

        logger.info("There are %s jobs waiting to start downloading" % cutoutjobs.count())

        cutoutjob = cutoutjobs.first()

        logger.info("Start downloading Cutout Job [ %s ]" % cutoutjob.pk)

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

                    for obj in objects:
                        if arq.get("thumbname") == obj.get("thumbname"):
                            object_id = obj.get("id")
                            object_ra = obj.get("ra")
                            object_dec = obj.get("dec")

                    start = timezone.now()
                    file_path = descutout.download_file(
                        arq.get('url'),
                        cutoutdir,
                        arq.get('filename')
                    )

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

from __future__ import absolute_import, unicode_literals

import os
import shutil
from smtplib import SMTPException

from celery import shared_task
# from celery.decorators import periodic_task
# from celery.task.schedules import crontab
from django.conf import settings
from django.contrib.auth.models import User

from product.descutoutservice import CutoutJobNotify, DesCutoutService
from product.export import Export
from product.importproduct import ImportTargetListCSV
from product.models import CutOutJob, FilterCondition, Product
from product.saveas import SaveAs
from product.serializers import FConditionSerializer

descutout = DesCutoutService()
cutoutJobNotify = CutoutJobNotify()
saveas = SaveAs()
export = Export()
importtargetlistcsv = ImportTargetListCSV()


# @periodic_task(
#     # Tempo de delay para a task check_jobs em minutos
#     run_every=(crontab(minute='*/%s' % 1)),
#     name="start_des_cutout_job",
#     ignore_result=True
# )
# def start_des_cutout_job():
#     """
#         Recupera todos os Cutoutjob com status start. 
#         instancia a Classe DesCutoutService,
#         executa o methodo start_job_by_id.
#         esse metodo vai enviar o job para o servico do des.
#     """
#     # Para cada job com status Start executa o metodo de submissão
#     for job in CutOutJob.objects.filter(cjb_status="st"):
#         descutout.start_job_by_id(job.pk)


# @periodic_task(
#     # run_every=(crontab(minute='*/1')),
#     # Tempo de delay para a task check_jobs em minutos
#     run_every=(crontab(minute='*/%s' % 1)),
#     # run_every=10.0,
#     name="check_jobs_running",
#     ignore_result=True
# )
# def check_jobs_running():
#     """
#         Recupera todos os cutoutjobs com status Running
#         e verifica no servico DESaccess o status do job
#         e os marca com status
#     """
#     # Pegar todos os CutoutJobs com status running
#     jobs = CutOutJob.objects.filter(cjb_status="rn")
#     # Faz um for para cara job
#     for job in jobs:
#         descutout.check_job_by_id(job.pk)


# @periodic_task(
#     # Tempo de delay para a task check_jobs em minutos
#     run_every=(crontab(minute='*/%s' % 1)),
#     name="download_cutoutjob",
#     ignore_result=True
# )
# def download_cutoutjob():
#     """Recupera todos os cutoutjobs com status before download. 
#     executa o metodo download_by_id. este metodo vai fazer o download dos resultados. 
#     e finalizar o job.
#     """
#     # Para cada job com status Before Download executa o metodo de
#     for job in CutOutJob.objects.filter(cjb_status="bd"):
#         descutout.download_by_id(job.pk)

# @shared_task()
# def purge_cutoutjob_dir(cutoutjob_id):
#     """Remove um diretório de cutout job do armazenamento local. 
#     esta task é disparada toda vez que um model CutouJob é deletado. usando signal.

#     Args:
#         cutoutjob_id (int): CutoutJob model primary key
#     """
#     descutout.purge_cutoutjob_dir(cutoutjob_id)


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Export Product Tasks %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#

@shared_task()
def export_target_by_filter(product_id, filetypes, user_id, filter_id=None, cutoutjob_id=None):
    """
    Este metodo vai exportar um produto do tipo Target,
    a tabela para formatos como csv e fits. e caso tenha cutouts
    vai criar um zip com o cutoutjob. todos os arquivos resultantes
    serao compactados e disponibilizados e ficaram no diretorio DATA_DIR/DATA_TMP_DIR
    :param cutoutjob_id:
    :return:
    """

    logger = export.logger

    logger.info("---------------------------------------------")
    logger.info("Starting Export Task for the product [%s]" % product_id)
    logger.debug("User: %s" % user_id)
    logger.debug("Product: %s" % product_id)
    logger.debug("Filetypes: %s" % ", ".join(filetypes))
    logger.debug("Filter: %s" % filter_id)
    logger.debug("CutoutJob: %s" % cutoutjob_id)

    # Criar o Diretorio de export
    try:
        # Recuperar o Model Product
        product = Product.objects.select_related().get(pk=int(product_id))

    except Product.DoesNotExist as e:
        logger.error("Product matching query does not exist. Product Id: %s" % product_id)
        # TODO enviar email de error

    user = User.objects.get(pk=int(user_id))

    try:
        # Notificação de inicio
        export.notify_user_export_start(user, product)

        # Criar o diretorio de export
        export_dir = export.create_export_dir(name=product.prd_name)

        # Recuperar as condicoes a serem aplicadas como filtros
        conditions = list()
        if filter_id != None and filter_id != "":
            queryset = FilterCondition.objects.filter(filterset=int(filter_id))

            for row in queryset:
                serializer = FConditionSerializer(row)
                conditions.append(serializer.data)

        # Para cada formato de arquivo executar uma task separada
        for filetype in filetypes:
            filetype = filetype.strip()

            if filetype == "csv":
                logger.info("Starting Task target_to_csv")

                # Task To CSV
                export.table_to_csv_by_id(
                    product_id=product.pk,
                    database=product.table.tbl_database,
                    schema=product.table.tbl_schema,
                    table=product.table.tbl_name,
                    filters=conditions,
                    export_dir=export_dir,
                    user_id=user_id
                )

                logger.info("Finished Task target_to_csv")

            elif filetype == "fits":
                # Task To Fits
                logger.info("Starting Task target_to_fits")

                # Primeiro deve gerar um csv para depois converter para fits.
                csvfile = export.table_to_csv_by_id(
                    product_id=product.pk,
                    database=product.table.tbl_database,
                    schema=product.table.tbl_schema,
                    table=product.table.tbl_name,
                    filters=conditions,
                    export_dir=export_dir,
                    user_id=user_id
                )

                logger.info("Csv File: %s" % csvfile)

                fname, extension = os.path.splitext(csvfile)

                fitsfile = "%s.fits" % fname
                logger.debug("FITS FILE %s" % fitsfile)

                fits = export.csv_to_fits(
                    csv=csvfile,
                    fits=fitsfile
                )

                logger.info("Finished Task target_to_fits")

        # Cutouts
        if cutoutjob_id not in [None, "", False, "false", "False", 0]:
            export_cutoutjob(cutoutjob_id, export_dir)

        logger.debug("Teste: %s" % cutoutjob_id)

        # Cria um arquivo zip com todos os arquivos gerados pelo export.
        url = export.create_zip(export_dir)

        # Notifica o Usuario sobre o Download.
        export.notify_user_export_success(user.pk, product.prd_display_name, url)

    except Exception as e:
        logger.error(e)

        # TODO: Deveria notificar o usuario em caso de falha mais o Celery esta retornando uma exception que nao
        # consegui corrigir Never call result.get() within a task!
        # See http://docs.celeryq.org/en/latest/userguide/tasks.html#task-synchronous-subtasks
        # A solucao provavel e mudar a estrutura de tasks ao inves de usar chord utilizar tasks normais
        # encadeadas e um callback no final.

        # export_notify_user_failure(user, product)

@shared_task()
def export_target_to_csv(product_id, database, schema, table, conditions, export_dir, user_id):
    """
        gera o arquivo csv do produto.
    """
    logger = export.logger

    logger.info("Starting Task target_to_csv")

    export.table_to_csv(
        product_id=product_id,
        database=database,
        schema=schema,
        table=table,
        filters=conditions,
        export_dir=export_dir,
        user_id=user_id
    )

    logger.info("Finished Task target_to_csv")


@shared_task()
def export_target_to_fits(product_id, database, schema, table, conditions, export_dir, user_id):
    """
        gera o arquivo fits do produto.
    """
    logger = export.logger

    logger.info("Starting Task target_to_fits")

    # Primeiro deve gerar um csv para depois converter para fits.
    csvfile = export.table_to_csv(
        product_id=product_id,
        database=database,
        schema=schema,
        table=table,
        filters=conditions,
        export_dir=export_dir,
        user_id=user_id
    )

    fname, extension = os.path.splitext(csvfile)

    fitsfile = "%s.fits" % fname
    logger.debug("FITS FILE %s" % fitsfile)

    fits = export.csv_to_fits(
        csv=csvfile,
        fits=fitsfile
    )

    logger.info("Finished Task target_to_fits")


@shared_task()
def export_cutoutjob(cutoutjob_id, export_dir):
    """
        Essa task cria um arquivo zip com as imagens de um cutoutjob.
    """
    logger = export.logger

    logger.info("Starting Task export_cutoutjob")

    cutoutjob = CutOutJob.objects.get(pk=cutoutjob_id)

    path = cutoutjob.cjb_cutouts_path

    export.product_cutouts(
        name=cutoutjob.cjb_display_name,
        path_origin=path,
        path_destination=export_dir
    )

    logger.info("Finished Task export_cutoutjob")


@shared_task()
def export_create_zip(self, user_id, product_name, export_dir):
    """
    Cria um arquivo zip com todos os arquivos gerados pelo export.
    """
    url = export.create_zip(export_dir)

    export.notify_user_export_success(user_id, product_name, url)


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Product Save As Tasks %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@shared_task()
def product_save_as(user_id, product_id, name, filter_id=None, description=None):
    logger = saveas.logger

    logger.info("Task product_save_as Started")

    logger.debug("User: %s" % user_id)
    logger.debug("Product: %s" % product_id)
    logger.debug("Name: %s" % name)
    logger.debug("Filter: %s" % filter_id)
    logger.debug("Description: %s" % description)

    # Criar a tabela
    saveas.create_table_by_product_id(user_id, product_id, name, filter_id, description)


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Product Import Target List CSV %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@shared_task()
def import_target_list(user_id, data):

    if data.get('mime') == 'csv':
        importtargetlistcsv.start_import(user_id, data)

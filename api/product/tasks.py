from __future__ import absolute_import, unicode_literals

import os
import shutil
from smtplib import SMTPException

from celery import chord
from celery import shared_task
from celery import task
from celery.decorators import periodic_task
from celery.task.schedules import crontab
from common.download import Download
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from product.descutoutservice import DesCutoutService, CutoutJobNotify
from product.export import Export
from product.models import CutOutJob
from product.models import FilterCondition
from product.models import Product
from product.saveas import SaveAs
from product.importproduct import ImportTargetListCSV
from product.serializers import FConditionSerializer

descutout = DesCutoutService()
cutoutJobNotify = CutoutJobNotify()
saveas = SaveAs()
export = Export()
importtargetlistcsv = ImportTargetListCSV()


@task(name="start_des_cutout_job_by_id")
def start_des_cutout_job_by_id(cutoutjob_id):
    """
        Esta Task vai instanciar a Classe DesCutoutService,
        executar o methodo start_job_by_id
        esse job vai enviar o job para o servico do des.

        :param cutoutjob_id: Chave pk do model product.CutOutModel
    """
    # descutout.start_job_by_id(int(cutoutjob_id))
    pass


@periodic_task(
    # run_every=(crontab(minute='*/1')),
    # Tempo de delay para a task check_jobs em minutos
    run_every=(crontab(minute='*/%s' % 1)),
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
    # descutout.check_jobs()
    pass


@task(name="download_cutoutjob")
def download_cutoutjob(id):
    descutout.download_by_jobid(id)


# @task(name="download_cutoutjob")
# def download_cutoutjob(id):
#     logger = descutout.logger

#     logger.info("Start downloading Cutout Job [ %s ]" % id)

#     cutoutjob = descutout.get_cutoutjobs_by_id(id)

#     # Changing the CutoutJob Status for Downloading
#     descutout.change_cutoutjob_status(cutoutjob, "dw")

#     cutoutdir = descutout.get_cutout_dir(cutoutjob)

#     allarqs = list()

#     image_formats = cutoutjob.cjb_image_formats
#     if image_formats is None:
#         image_formats = 'png'

#     formats = image_formats.split(',')

#     logger.info("Only download the files with these formats: [ %s ]" % image_formats)

#     # Deixar na memoria a lista de objetos ja associada com os nomes dos arquivos
#     objects = descutout.get_objects_from_file(cutoutjob)

#     # Recuperar o arquivo de Results
#     result_file_path = os.path.join(descutout.data_dir, cutoutjob.cjb_results_file)
#     logger.debug("Result File Path: %s" % result_file_path)
#     with open(result_file_path, 'r') as result_file:
#         lines = result_file.readlines()
#         for url in lines:
#             arq = descutout.parse_result_url(url)

#             # Verifica se o formato do arquivo esta na lista de formatos a serem baixados
#             # os formatos ficam no campo cjb_image_formats
#             if arq.get('file_type').lower() in formats:
#                 allarqs.append(arq)

#                 object_id = None
#                 object_ra = None
#                 object_dec = None
#                 file_size = None
#                 finish = None

#                 logger.info("Downloading [ %s ]" % arq.get('filename'))

#                 for obj in objects:
#                     if arq.get("thumbname") == obj.get("thumbname"):
#                         object_id = obj.get("id")
#                         object_ra = obj.get("ra")
#                         object_dec = obj.get("dec")

#                 start = timezone.now()
#                 file_path = Download().download_file_from_url(
#                     arq.get('url'),
#                     cutoutdir,
#                     arq.get('filename'),
#                     ignore_errors=True
#                 )

#                 if file_path is not None:
#                     file_size = os.path.getsize(file_path)
#                     finish = timezone.now()

#                 cutout = descutout.create_cutout_model(
#                     cutoutjob,
#                     filename=arq.get('filename'),
#                     thumbname=arq.get('thumbname'),
#                     type=arq.get('file_type'),
#                     filter=None,
#                     object_id=object_id,
#                     object_ra=object_ra,
#                     object_dec=object_dec,
#                     file_path=file_path,
#                     file_size=file_size,
#                     start=start,
#                     finish=finish)

#     result_file.close()

#     # Deletar o job no Servico
#     descutout.delete_job(cutoutjob)

#     # Adicionar o tempo de termino
#     cutoutjob.cjb_finish_time = timezone.now()
#     cutoutjob.save()

#     # Changing the CutoutJob Status for Done
#     descutout.change_cutoutjob_status(cutoutjob, "ok")


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


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Export Product Tasks %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#

@task(name="export_target_by_filter")
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

    logger.info("Starting Export Task for the product %s" % product_id)
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

    # Chords Task http://docs.celeryproject.org/en/latest/userguide/canvas.html#chords
    header = list()

    try:

        # Notificação de inicio
        export.notify_user_export_start(user, product)

        # Criar o diretorio de export
        export_dir = export.create_export_dir(name=product.prd_name)

        # Recuperar as condicoes a serem aplicadas como filtros
        conditions = list()
        if filter_id is not None and filter_id is not "":
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


@task(name="export_target_to_csv")
@shared_task
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


@task(name="export_target_to_fits")
@shared_task
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


@task(name="export_cutoutjob")
@shared_task
def export_cutoutjob(cutoutjob_id, export_dir):
    """
        Essa task cria um arquivo zip com as imagens de um cutoutjob.
     """
    logger = export.logger

    logger.info("Starting Task export_cutoutjob")

    cutoutjob = CutOutJob.objects.get(pk=cutoutjob_id)

    path = cutoutjob.cjb_cutouts_path

    # Mantendo compatibilidade com Jobs anteriores ao path ser guardado
    # TODO: Pode ser removido se todos os cutouts com o campo cjb_cutouts_path forem removidos
    if path is None or path == "":
        logger.warning(
            "CutoutJob does not have the path field, the path will be generated using the result_file field.")
        path = cutoutjob.cjb_results_file
        path = os.path.dirname(path)
        path = path.split(settings.DATA_DIR)[1]

    export.product_cutouts(
        name=cutoutjob.cjb_display_name,
        path_origin=path.strip("/"),
        path_destination=export_dir
    )

    logger.info("Finished Task export_cutoutjob")


@task(name="export_create_zip")
@shared_task
def export_create_zip(self, user_id, product_name, export_dir):
    """
    Cria um arquivo zip com todos os arquivos gerados pelo export.
    """
    url = export.create_zip(export_dir)

    export.notify_user_export_success(user_id, product_name, url)


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

    # Criar a tabela
    saveas.create_table_by_product_id(user_id, product_id, name, filter_id, description)


# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Product Import Target List CSV %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@task(name="import_target_list")
@shared_task
def import_target_list(user_id, data):

    if data.get('mime') == 'csv':
        importtargetlistcsv.start_import(user_id, data)

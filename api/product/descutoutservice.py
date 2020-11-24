import io
import json
import logging
import math
import os
import shutil
import tarfile
import traceback
from datetime import datetime, timedelta
from pathlib import Path

import humanize
import pandas as pd
from common.desaccess import DesAccessApi
from common.download import Download
from common.models import Filter
from common.notify import Notify
from django.conf import settings
from django.db.models import Sum
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.timezone import utc
from lib.CatalogDB import CatalogObjectsDBHelper

from product.association import Association
from product.models import Catalog, Cutout, CutOutJob, Desjob


class DesCutoutService:
    """This Allows the execution of a Cutout job using the DESaccess API.
    has methods for submitting, monitoring, downloading and registering jobs and their results.

    Some job steps are asynchronous and are controlled by Celery tasks.

    the process starts with the creation of a Cutoutjob model. that starts with status start.
    A celery daemon searches from time to time for jobs with this status and submits that job to DESacces.
    Another celery daemon looks for jobs that have been submitted, and when they finish running, the results are downloaded and recorded.

    """
    db = None

    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

        # fazer os request sem verificar o certificado SSL / HTTPS
        self.verify_ssl = False

        # Cria uma instancia da classe DesAccesApi que é responsavel pela integração com o serviço DESaccess.
        self.desapi = DesAccessApi()
        # Configura para usar o mesmo log desta classe,
        # assim as mensagens de log referente as requisições vão ficar visiveis neste log.
        self.desapi.setLogger(self.logger)

    def get_cutoutjobs_by_id(self, id):
        """Returns a CutoutJob model by its id.

        Args:
            id (int): CutoutJob model primary key

        Returns:
            product.models.CutOutJob: Instance of CutOutJob.
        """
        try:
            return CutOutJob.objects.get(pk=int(id))
        except CutOutJob.DoesNotExist as e:
            self.on_error(id, e)

    def get_job_path(self, id):
        """Returns the path where the job's local files are located.

        Args:
            id (int): CutoutJob model primary key

        Returns:
            str: Path where are the files for this job.
        """
        basepath = os.path.join(settings.DATA_DIR, 'cutouts')
        job_path = os.path.join(basepath, str(id))
        return job_path

    def create_job_path(self, id):
        """Creates a directory for the cutout job.

        Args:
            id (int): CutoutJob model primary key

        Raises:
            error: Failed to create the directory

        Returns:
            str: Path where are the files for this job.
        """
        job_path = self.get_job_path(id)
        self.logger.debug("Trying to create the job directory")

        try:

            Path(job_path).mkdir(parents=True, exist_ok=True)
            self.logger.info("Directory successfully created [%s]" % job_path)
            return job_path

        except OSError as error:
            self.logger.error("Failed to create the directory [%s]" % job_path)
            raise error

    def get_summary_path(self, id, jobid):
        """Returns the path to a DES job's summary file.

        Args:
            id (int): CutoutJob model primary key
            jobid (str): Universally unique identifier of DES job

        Returns:
            str: Path to summary.json file
        """
        summary_path = os.path.join(self.get_job_path(id), str(jobid), 'summary.json')
        return summary_path

    def start_job_by_id(self, id):
        """This method submits a local job to DESaccess and creates a desjob. 
        it also makes the selection of the parameters that will be used by the desjob to create the cutouts.

        Depending on the number of positions that will be sent more than one DES job can be created.

        At the end of this function the job will be in running status. 
        a daemon will look for jobs in this status and check when the DES job has finished running.

        Args:
            id (int): CutoutJob model primary key

        """
        self.logger.info("Des Cutout Starting Job by ID %s" % id)

        # Recupera o Model CutoutJob pelo id
        try:
            job = self.get_cutoutjobs_by_id(id)

            self.logger.debug("CutoutJob Name: %s" % job.cjb_display_name)

            # Notificacao por email de Inicio do Job
            CutoutJobNotify().create_email_message(job)

            # Alterar o status para Before Submit
            job.cjb_status = 'bs'
            job.save()

            # Criar um diretório para os arquivos do Job.
            job.cjb_cutouts_path = self.create_job_path(id)
            job.save()

            # Parametros de submissão
            data = dict({})

            # Tamanho dos Cutouts
            if job.cjb_xsize:
                data.update({"xsize": job.cjb_xsize})
            if job.cjb_ysize:
                data.update({"ysize": job.cjb_ysize})

            # Geração de Imagens Fits
            if job.cjb_make_fits:
                data.update({
                    "make_fits": True,
                    "colors_fits": job.cjb_fits_colors
                })

            # Geração de Imagens Coloridas com Stiff
            if job.cjb_make_stiff:
                data.update({
                    "make_rgb_stiff": True,
                    "rgb_stiff_colors": job.cjb_stiff_colors
                })

            # Geração de Imagens Coloridas com lupton
            if job.cjb_make_lupton:
                data.update({
                    "make_rgb_lupton": True,
                    "rgb_lupton_colors": job.cjb_lupton_colors
                })

            # Seleção do Release
            data.update({
                "release": job.cjb_tag
            })

            # Preparar a lista de objetos para submissão

            # Recuperar da settings a quantidade maxima de rows por job
            config = settings.DESACCESS_API
            max_objects = config["MAX_OBJECTS"]

            # Checar o tamanho do lista e dividir em varios jobs caso ultrapasse o limit.
            count = self.get_catalog_count(job.cjb_product_id)

            # Quantidade de Paginas ou jobs que serao necessários.
            pages_count = math.ceil(float(count) / max_objects)
            # self.logger.debug("Pages: [%s]" % pages_count)

            # Fazer a query dos objetos dividindo em paginas pelo tamanho maximo de objetos que o Desaccess aceita.
            for page in range(1, pages_count + 1):
                # self.logger.debug("Current Page: [%s]" % page)

                # Calculo do Offset para a paginação.
                offset = ((page - 1) * max_objects)
                # self.logger.debug("Offset: [%s]" % offset)

                rows = self.get_catalog_objects(job.cjb_product.pk, limit=max_objects, offset=offset)

                df = pd.DataFrame(rows)

                # Cria uma string no formato csv para ser enviada para Desaccess.
                s_positions = io.StringIO()
                df.to_csv(s_positions, columns=["meta_ra", "meta_dec"], header=["RA", "DEC"], index=False)

                data.update({
                    "positions": s_positions.getvalue(),
                })

                # Submeter o Job e guardar o id retornado pelo Descut
                jobid = self.desapi.submit_cutout_job(data)

                # Cria uma instancia do Desjob
                record = Desjob.objects.create(
                    djb_cutout_job=job,
                    djb_jobid=jobid)
                record.save()

                self.logger.info("New Desjob was created. Desjob: [%s] Jobid: [%s]" % (record.pk, jobid))

                # Criar um arquivo csv com as posições enviadas para este job este aquivo sera usado para associar os resultados.
                target_csv = os.path.join(self.get_job_path(job.id), "{}_targets.csv".format(jobid))
                df.to_csv(
                    target_csv,
                    sep=";",
                    header=True,
                    index=False
                )
                self.logger.debug("Csv file with the positions of this jobid was created. CSV: [%s]" % target_csv)

            # Cutout Job enviado e aguardando termino na API
            # Alterar o status para Running
            job.cjb_status = 'rn'
            job.save()

            self.logger.info("Status changed to Running")

            # Apartir daqui o job está rodando no NCSA.
            # Uma daemon vai ficar checando o andamento do Job usando o metodo check_job_by_id.

        except CutOutJob.DoesNotExist as e:
            self.on_error(id, e)
            raise e

        except Exception as e:
            self.on_error(id, e)
            raise e

    def check_job_by_id(self, id):
        """This method checks the status of all DES Jobs related to this Cutout Job. 
        When all DES jobs finish Cutout Job status is changed to Before Download, 
        at this point another daemon is looking for jobs with this status to download and register files.

        Args:
            id (int): CutoutJob model primary key
        """
        self.logger.info("Des Cutout Check Job by ID %s" % id)

        try:
            # Recupera o Model CutoutJob pelo id
            job = self.get_cutoutjobs_by_id(id)

            # Para cada Desjob associado ao CutoutJob com status None.
            desjobs = job.desjob_set.filter(djb_status=None)

            for desjob in desjobs:
                try:
                    # Verifica se o status do job no Descut
                    job_summary = self.desapi.check_job_status(desjob.djb_jobid)

                    # Se o retorno do Check for None signica que o job ainda não foi finalizado.
                    if job_summary is None:
                        return

                    # Alterar o Status do Desjob
                    desjob.djb_status = job_summary["job_status"]
                    desjob.djb_message = job_summary["job_status_message"]
                    desjob.djb_start_time = job_summary["job_time_start"]
                    desjob.djb_finish_time = job_summary["job_time_complete"]

                    desjob.save()

                except Exception as e:
                    self.on_error(id, e)

            # Verifica se todos os Desjobs tiverem acabado de executar muda o status.
            desjobs = job.desjob_set.filter(djb_status=None)
            if len(desjobs) == 0:
                self.logger.info("All DES Jobs for this Cutout Job have been executed.")
                # Alterar o status para Before Download
                job.cjb_status = "bd"
                job.save()

        except Exception as e:
            self.on_error(id, e)

    def download_by_id(self, id):
        """Starts the download phase of the results. 
        Each DES Job associated with the Cutout Job is downloaded sequentially. 
        at the end of downloading all results, Cutout Job is successfully completed.

        Args:
            id (int): CutoutJob model primary key
        """
        # Recupera o Model CutoutJob pelo id
        job = self.get_cutoutjobs_by_id(id)

        # Alterar o status para Downloading
        job.cjb_status = "dw"
        job.save()

        for desjob in job.desjob_set.filter(djb_status="success"):
            self.download_by_jobid(job.id, desjob.djb_jobid)

        # Depois de baixar todos os desjobs finalizar o CutoutJob
        self.on_success(id)

    def download_by_jobid(self, id, jobid):
        """Performs the download of the results of a DES Job.
        the result is a tar.gz file with all the files. 
        this tar.gz is extracted. 
        a position can generate more than one file, and all files are registered in the Cutout model.

        Args:
            id (int): CutoutJob model primary key
            jobid (str): Universally unique identifier of DES job

        """
        self.logger.info("Starting download Cutouts ID:[%s] Jobid [ %s ]" % (id, jobid))

        try:
            # Recupera o Model CutoutJob pelo id
            job = self.get_cutoutjobs_by_id(id)

            # Recupera o Model Desjob
            desjob = job.desjob_set.get(djb_jobid=jobid)

            # Baixar o tar.gz com todos os dados
            filename = self.desapi.get_cutout_tar_filename(jobid)
            url = self.desapi.get_cutout_files_url(jobid)
            job_path = self.get_job_path(id)

            tar_filepath = Download().download_file_from_url(url, job_path, filename)

            if os.path.exists(tar_filepath):
                self.logger.info("Files was successfully downloaded!")
                self.logger.debug("Filepath: [%s]" % tar_filepath)

                # Extrair o tar.gz
                self.extract_file(tar_filepath, job_path)

                # Verificar se ao extrarir o arquivo criou o diretório
                image_path = os.path.join(job_path, str(jobid))
                if not os.path.exists(image_path):
                    raise Exception("Failed to extract the tar.gz file: [%s]" % filename)

                # Arquivo já foi extraido, apagar o tar.gz
                os.unlink(tar_filepath)
                self.logger.info("File was extracted and tar.gz was deleted.")

                # Altera o status do Desjob para downloaded
                desjob.djb_status = "downloaded"
                desjob.save()

                # Inciar o registro das imagens geradas
                self.register_cutouts_by_jobid(id, jobid)

            else:
                raise Exception("%s file not downloaded" % filename)

        except Exception as e:
            msg = "Error downloading Des job files: %s" % e
            self.on_error(id, msg)

    def register_cutouts_by_jobid(self, id, jobid):
        """Register all files in a DES Job. 
        each file will have a record in the Cutout model. 
        for each file an association with a position will be made.

        Args:
            id (int): CutoutJob model primary key
            jobid (str): Universally unique identifier of DES job
        """
        self.logger.info("Starting Registration of Cutouts ID:[%s] Jobid [ %s ]" % (id, jobid))

        # Recupera o Model CutoutJob pelo id
        job = self.get_cutoutjobs_by_id(id)

        # Recupera o Model Desjob
        desjob = job.desjob_set.get(djb_jobid=jobid)

        # Ler o Targets.csv, arquivo com a lista de todas as coordenadas que foram enviadas.
        targets_file = os.path.join(self.get_job_path(job.id), "{}_targets.csv".format(jobid))
        df_targets = pd.read_csv(
            targets_file,
            sep=";",
            index_col="meta_id",
            dtype=dict({
                "meta_ra": "str",
                "meta_dec": "str",
            }))

        # self.logger.debug(df_targets.head())

        # Ler o Summary.json
        summary_file = self.get_summary_path(id, jobid)
        self.logger.debug("Summary File: [%s]" % summary_file)
        with open(summary_file) as fp:
            summary = json.load(fp)

        # Array com os dados do cutout, cada coordenada de targets gera um elemento neste array.
        # cada elemento tem todas as configurações usadas, as coordendas e um array FILES com os arquivos gerados para esta coordenada.
        cutouts = summary["cutouts"]

        total_images = 0
        # Para cada cutout, procurar no targets qual é o id relacionado a esta coordenada.
        # esse Id sera usado para registrar os arquivos desta coordenada com um target especifico.
        for cutout in cutouts:
            try:
                # Procura no dataframe targets um registro que tenhas as coordenadas Ra e Dec iguais as do cutout.
                # Por algum motivo a comparação entre as coordenas só funcionou usando String,
                # usando float, não encontra todos os valores mesmo sendo visualmente identicos.
                result = df_targets.loc[(df_targets["meta_ra"] == str(cutout["RA"])) & (df_targets["meta_dec"] == str(cutout["DEC"]))]

                result.reset_index(inplace=True)
                result = result.to_dict('records')

                if len(result) == 1:
                    target = result[0]
                    self.logger.info("Cutout RA: [%s] Dec: [%s] Target Id: [%s]" % (cutout["RA"], cutout["DEC"], target["meta_id"]))

                    # TODO: Para cada Arquivo de imagem, criar um registro no Model Cutouts
                    records = self.register_images(job, desjob, cutout, target["meta_id"])

                    total_images += len(records)
                else:
                    self.logger.warning("Cutout RA: [%s] Dec: [%s] Was not associated with a target! Match: %s" % (cutout["RA"], cutout["DEC"], result))

            except Exception as e:
                self.on_error(jobid, e)

        self.logger.info("Total of [%s] images were registered" % total_images)

    def register_images(self, job, desjob, cutout, object_id):
        """Creates a record in the Cutout model.
        For each position/object register all image files.

        Args:
            job (product.models.CutOutJob): Cutout Job instance.
            desjob (product.models.DesJob): Des Job instance.
            cutout (dict): File information already associated with position.
            object_id (str): Object Id referring to the position.

        Returns:
            array: Array of Cutout model instances
        """

        jobid = desjob.djb_jobid
        records = []

        try:
            for filename in cutout['FILES']:

                filename = filename.strip()

                name, extension = os.path.splitext(filename)
                extension = extension.strip(".")

                img_filter = name.split("_")[1]
                band = self.get_band_model(img_filter)

                img_format = None
                if extension == "fits":
                    img_format = "fits"
                else:
                    img_format = name.split('_')[2]

                job_path = self.get_job_path(job.id)

                file_path = os.path.join(job_path, jobid, cutout['TILENAME'], name.split("_")[0])

                record = Cutout.objects.create(
                    cjb_cutout_job=job,
                    cjb_des_job=desjob,
                    ctt_jobid=jobid,
                    ctt_file_name=filename,
                    ctt_file_type=extension,
                    ctt_filter=band,
                    ctt_object_id=object_id,
                    ctt_object_ra=cutout['RA'],
                    ctt_object_dec=cutout['DEC'],
                    ctt_img_format=img_format,
                    ctt_file_path=file_path,
                    ctt_file_size=os.path.getsize(os.path.join(file_path, filename)),
                )

                records.append(record)

            Cutout.objects.bulk_create(records, ignore_conflicts=True)

            return records

        except Exception as e:
            raise Exception("Failed to register images. %s" % e)

    def get_band_model(self, band):
        """Returns the common.Filter model for a band by name.

        Args:
            band (str): band name exemple "g"

        Returns:
            common.models.Filter: A instance of Filter model.
        """
        try:
            record = Filter.objects.get(filter=band)
        except Filter.DoesNotExist:
            record = Filter.objects.create(
                project="DES",
                filter=band,
            )
            record.save()
            self.logger.info("A record was created for the %s band in the model common.Filter" % band)

        return record

    def get_catalog_count(self, product_id):
        """Executes a query in the catalog and returns the total number of records.

        Args:
            product_id (int): Primary key of the Product model that represents the catalog that will be made the query.

        Returns:
            int: Total catalog lines.
        """
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        # Instancia da classe de Banco de dados utilizada para query em tabelas de catalogos.
        catalog_db = CatalogObjectsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database
        )

        # Seta o log na instancia da catalog_db para que as querys executadas aparareçam no log de cutout.
        catalog_db.setLogger(self.logger)

        count = catalog_db.count()

        self.logger.info("Total number of objects in the catalog: [%s]" % count)

        return count

    def get_catalog_objects(self, product_id, limit=None, offset=None):
        """Executes a query in the catalog and returns an array of objects already using association for the id, ra and dec columns.

        This query can be paged using the limit and offset parameters.  

        Args:
            product_id (int): Primary key of the Product model that represents the catalog that will be made the query.
            limit (int, optional): Maximum number of rows in this query.. Defaults to None.
            offset (int optional): From which result the query will be executed. Defaults to None.

        Returns:
            array: Returns an array of catalog objects, where each object has the attributes meta_id, meta_ra and meta_dec.
        """

        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        self.logger.info("Executing the query in the catalog table. Table: [%s]" % (catalog.tbl_name))

        # colunas associadas ao produto
        associations = Association().get_associations_by_product_id(product_id)
        self.logger.debug("Associations: [%s]" % associations)

        # Criar uma lista de colunas baseda nas associacoes isso para limitar a query de nao usar *
        columns = Association().get_properties_associated(product_id)
        self.logger.debug("Columns: [%s]" % columns)

        # Instancia da classe de Banco de dados utilizada para query em tabelas de catalogos.
        catalog_db = CatalogObjectsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database
        )
        # Seta o log na instancia da catalog_db para que as querys executadas aparareçam no log de cutout.
        catalog_db.setLogger(self.logger)

        # Lista com os resultados da query.
        records = list()

        # Executa a query
        rows, count = catalog_db.query(
            columns=columns,
            limit=limit,
            start=offset
        )

        # Para cada linha alterar os nomes de colunas utilizando as informações de associação.
        # O resultado é um array records onde cada record tem sempre os mesmos atributos (meta_id, meta_ra, meta_dec)
        # independente dos nomes originais das colunas.
        for row in rows:
            ra = row[associations["pos.eq.ra;meta.main"]]
            dec = row[associations["pos.eq.dec;meta.main"]]

            record = dict({
                "meta_id": row[associations["meta.id;meta.main"]],
                "meta_ra": float("{:.6f}".format(ra)),
                "meta_dec": float("{:.6f}".format(dec))
            })
            records.append(record)

        del rows

        return records

    def extract_file(self, filepath, path):
        """Extract a tar.gz file to a directory.

        Args:
            filepath (str): path to the tar.gz file to be extracted.
            path (str): path where the file will be extracted.
        """
        tar = tarfile.open(filepath)
        tar.extractall(path)
        tar.close()

    def purge_cutoutjob_dir(self, id):
        """Removes all files from a Cutout Job from the local directory. 
        this method must be executed every time a Cutout Job model is deleted. 
        for this, this method is linked to the model using Signal.

        Args:
            id (int): CutoutJob model primary key
        """
        try:
            # Recupera o Model CutoutJob pelo id
            jobpath = self.get_job_path(id)
            self.logger.info("Removing Cutout Job Dir. ID: [%s]" % id)

            shutil.rmtree(jobpath)

            self.logger.info("Removed Dir [ %s ]" % jobpath)

        except Exception as e:
            self.logger.error(e)

    def on_success(self, id):
        """This method is performed at the end of the Cutout Job. 
        changes status to success, saves information about job completion. 
        and execute the method that erases DES Job in the DESaccess service.

        Args:
            id (int): CutoutJob model primary key
        """

        self.logger.debug("Finishing the CutoutJob. ID: [%s]" % id)

        try:
            # Recupera o Model CutoutJob pelo id
            job = self.get_cutoutjobs_by_id(id)

            # Apagar Os Jobs no Descut
            for desjob in job.desjob_set.all():
                self.desapi.delete_job(desjob.djb_jobid)
                # Muda o Status do Desjob para deleted.
                desjob.djb_status = 'deleted'
                desjob.save()

            # Guardar o tamanho total e a quantidade das imagens geradas.
            job.cjb_file_size = job.cutout_set.aggregate(sum_size=Sum('ctt_file_size')).get("sum_size")
            job.cjb_files = job.cutout_set.count()
            # Muda o Status para Done
            job.cjb_status = "ok"
            job.cjb_finish_time = datetime.utcnow().replace(tzinfo=utc)
            job.save()

            # Notificacao por email de Inicio do Job
            CutoutJobNotify().create_email_message(job)

            self.logger.info("Cutout Job Finish. ID: [%s]" % id)
        except Exception as e:
            self.on_error(id, e)

    def on_error(self, id, error):
        """This method is executed only in case of a Cutout job failure.
        change the status to error and save the error message and notify the user of the failure.

        Args:
            id (int): CutoutJob model primary key
            error (str): Error or execption message that caused the failure.
        """
        trace = traceback.format_exc()
        self.logger.error(trace)
        self.logger.error(error)

        # Recupera o Model CutoutJob pelo id
        job = self.get_cutoutjobs_by_id(id)

        # Alterar o status do Job
        job.cjb_status = "er"
        # Alterar a data de termino
        job.cjb_finish_time = datetime.utcnow().replace(tzinfo=utc)
        # Alterar o campo de erro
        job.cjb_error = "{} ERROR: [{}]".format(str(trace), error)
        job.save()

        # Notificacao por email de Inicio do Job
        CutoutJobNotify().create_email_message(job)


# ----------------------------------------------< CUTOUT NOTIFICATION >--------------------------------------------------
class CutoutJobNotify:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

    def create_email_message(self, cutoutjob):

        if cutoutjob.owner.email:
            to_email = cutoutjob.owner.email
            message = None

            if cutoutjob.cjb_status == 'st':
                subject = "Mosaic in progress"
                message = self.generate_start_email(cutoutjob)

            elif cutoutjob.cjb_status == 'ok':
                subject = "Mosaic Finish"
                message = self.generate_success_email(cutoutjob)

            elif cutoutjob.cjb_status == 'er':
                subject = "Mosaic Failed"
                message = self.generate_failure_email(cutoutjob)

                # Em caso de falha abre um ticket
                self.generate_failure_ticket(cutoutjob)

            elif cutoutjob.cjb_status == 'je':
                subject = "Mosaic Failed"
                message = self.generate_failure_email(cutoutjob)

                # Em caso de falha abre um ticket
                self.generate_failure_ticket(cutoutjob)

            if message:
                self.logger.info("Sending Notification Email. Subject: [%s]" % subject)
                Notify().send_email(subject, message, to_email)
        else:
            self.logger.info("It was not possible to notify the user, for not having the email registered.")

    def generate_success_email(self, cutoutjob):
        try:

            tag = None
            files_size = None
            start = cutoutjob.cjb_start_time
            finish = cutoutjob.cjb_finish_time

            if cutoutjob.cjb_tag:
                tag = cutoutjob.cjb_tag.upper()

            if cutoutjob.cjb_files > 0:
                files_size = humanize.naturalsize(cutoutjob.cjb_file_size)

            tdelta = finish - start
            seconds = tdelta.total_seconds()
            execution_time = str(timedelta(seconds=seconds)).split('.')[0]
            execution_time_humanized = humanize.naturaldelta(timedelta(seconds=seconds))

            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
                "cutoutjob_tag": tag,
                "cutoutjob_xsize": int((float(cutoutjob.cjb_xsize) * 60)),  # converter para arcsec
                "cutoutjob_ysize": int((float(cutoutjob.cjb_ysize) * 60)),
                "n_objects": cutoutjob.cjb_product.table.catalog.ctl_num_objects,
                "n_files": cutoutjob.cjb_files,
                "files_size": files_size,
                "start": str(start.strftime("%Y-%m-%d %H:%M")),
                "finish": str(finish.strftime("%Y-%m-%d %H:%M")),
                "execution_time": execution_time,
                "execution_time_humanized": execution_time_humanized
            })

            return render_to_string("cutout_notification_finish.html", context)

        except Exception as e:
            self.logger.error(e)

    def generate_start_email(self, cutoutjob):
        try:
            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
            })

            return render_to_string("cutout_notification_start.html", context)

        except Exception as e:
            self.logger.error(e)

    def generate_failure_email(self, cutoutjob):
        try:
            start = cutoutjob.cjb_start_time
            finish = timezone.now()
            tdelta = finish - start
            seconds = tdelta.total_seconds()
            execution_time_humanized = humanize.naturaldelta(timedelta(seconds=seconds))

            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
                "execution_time_humanized": execution_time_humanized
            })

            return render_to_string("cutout_notification_error.html", context)

        except Exception as e:
            self.logger.error(e)

    def generate_failure_ticket(self, cutoutjob):
        try:

            subject = "%s Mosaic Failed" % cutoutjob.pk

            message = ("email: %s\nusername: %s\ncutoutjob: %s - %s\ntarget: %s - %s" % (cutoutjob.owner.username,
                                                                                         cutoutjob.owner.email,
                                                                                         cutoutjob.pk,
                                                                                         cutoutjob.cjb_display_name,
                                                                                         cutoutjob.cjb_product.pk,
                                                                                         cutoutjob.cjb_product.prd_display_name))

            Notify().send_email_failure_helpdesk(subject, message)

        except Exception as e:
            self.logger.error(e)

import csv
import io
import json
import logging
import math
import os
import tarfile
import traceback
from datetime import datetime, timedelta
from pathlib import Path
from pprint import pformat
from urllib.parse import urljoin

import humanize
import pandas as pd
import requests
from common.download import Download
from common.models import Filter
from common.notify import Notify
from django.conf import settings
from django.db.models import Sum
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.timezone import utc
from lib.CatalogDB import CatalogObjectsDBHelper
from requests.packages.urllib3.exceptions import InsecureRequestWarning

from product.association import Association
from product.models import Catalog, Cutout, CutOutJob, Desjob

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


class DesCutoutService:
    db = None

    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

        # fazer os request sem verificar o certificado SSL / HTTPS
        self.verify_ssl = False

    def get_cutoutjobs_by_id(self, id):
        try:
            return CutOutJob.objects.get(pk=int(id))
        except CutOutJob.DoesNotExist as e:
            self.on_error(id, e)

    def get_job_path(self, id):
        basepath = os.path.join(settings.DATA_DIR, 'cutouts')
        job_path = os.path.join(basepath, str(id))
        return job_path

    def create_job_path(self, id):
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
        summary_path = os.path.join(self.get_job_path(id), str(jobid), 'summary.json')
        return summary_path

    def start_job_by_id(self, id):
        self.logger.info("Des Cutout Starting Job by ID %s" % id)

        # Recupera o Model CutoutJob pelo id
        try:
            job = self.get_cutoutjobs_by_id(id)

            self.logger.debug("CutoutJob Name: %s" % job.cjb_display_name)

            # Alterar o status para Before Submit
            job.cjb_status = 'bs'
            job.save()

            # Criar um diretório para os arquivos do Job.
            job.cjb_cutouts_path = self.create_job_path(id)
            job.save()

            # Notificacao por email
            # CutoutJobNotify().create_email_message(cutoutjob)

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
            config = settings.DESCUTOUT_SERVICE
            max_objects = config["MAX_OBJECTS"]

            # Checar o tamanho do lista e dividir em varios jobs caso ultrapasse o limit.
            count = self.get_catalog_count(job.cjb_product_id)

            # Quantidade de Paginas ou jobs que serao necessários.
            pages_count = math.ceil(float(count) / max_objects)
            self.logger.debug("Pages: [%s]" % pages_count)

            # Fazer a query dos objetos dividindo em paginas pelo tamanho maximo de objetos que o Desaccess aceita.
            for page in range(1, pages_count + 1):
                self.logger.debug("Current Page: [%s]" % page)

                # Calculo do Offset para a paginação.
                offset = ((page - 1) * max_objects)
                self.logger.debug("Offset: [%s]" % offset)

                rows = self.get_catalog_objects(job.cjb_product.pk, limit=max_objects, offset=offset)

                df = pd.DataFrame(rows)

                s_positions = io.StringIO()
                df.to_csv(s_positions, columns=["meta_ra", "meta_dec"], header=["RA", "DEC"], index=False)

                data.update({
                    "positions": s_positions.getvalue(),
                })

                # Submeter o Job e guardar o id retornado pelo Descut
                jobid = self.submit_job(data)

                # Cria uma instancia do Desjob
                record = Desjob.objects.create(
                    djb_cutout_job=job,
                    djb_jobid=jobid)
                record.save()

                self.logger.info("New Desjob was created. Desjob: [%s] Jobid: [%s]" % (record.pk, jobid))

                # Criar um arquivo csv com as posições enviadas para este job
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

    def login(self, ):
        """Obtains an auth token using the username and password credentials for a given database.
        """

        config = settings.DESCUTOUT_SERVICE

        url = "{}/login".format(config['API_URL'])
        self.logger.debug("Login URL: [%s]" % url)

        # Dados para a Autenticação.
        data = {'username': config['USERNAME'], 'password': config['PASSWORD'], 'database': config['DATABASE']}

        # Login to obtain an auth token
        r = requests.post(url, data, verify=self.verify_ssl)

        self.logger.debug("Login Status: [%s]" % r.json()['status'])

        if r.json()['status'] != 'ok':
            raise Exception(r.json()['message'])

        return r.json()['token']

    def submit_job(self, data):
        """Submits a query job and returns the complete server response which includes the job ID.

        Args:
            data ([type]): [description]

        Returns:
            [type]: [description]
        """
        self.logger.info("Submiting Descut Job")
        self.logger.debug(data)

        config = settings.DESCUTOUT_SERVICE
        url = "{}/job/cutout".format(config['API_URL'])

        # Submit job
        r = requests.put(
            url,
            data=data,
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        self.logger.debug("Response: %s" % response)
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            # Retorna o jobid
            self.logger.debug("Descut Job Submited with Jobid: [%s]" % response["jobid"])

            return response["jobid"]
        else:
            msg = "Error submitting job: %s" % response["message"]
            raise Exception(msg)

    def check_job_by_id(self, id):
        self.logger.info("Des Cutout Check Job by ID %s" % id)

        try:
            # Recupera o Model CutoutJob pelo id
            job = self.get_cutoutjobs_by_id(id)

            # Para cada Desjob associado ao CutoutJob com status None.
            desjobs = job.desjob_set.filter(djb_status=None)

            for desjob in desjobs:
                try:
                    # Verifica se o status do job no Descut
                    job_summary = self.check_job_status(desjob.djb_jobid)

                    # Se o retorno do Check for None signica que o job ainda não foi finalizado.
                    if job_summary is None:
                        return

                    # self.logger.debug(job_summary)

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
                self.logger.info("All Desjobs finished executing.")
                # Alterar o status para Before Download
                job.cjb_status = "bd"
                job.save()

        except Exception as e:
            self.on_error(id, e)

    def check_job_status(self, jobid):
        """[summary]

        Args:
            jobid ([type]): [description]

        Raises:
            Exception: [description]

        Returns:
            [type]: [description]
        """

        self.logger.info("Check Status for Descut Jobid: [%s]")

        config = settings.DESCUTOUT_SERVICE
        url = "{}/job/status".format(config['API_URL'])

        r = requests.post(
            url,
            data={
                "job-id": jobid
            },
            headers={'Authorization': 'Bearer {}'.format(self.login())},
            verify=self.verify_ssl
        )

        response = r.json()
        self.logger.debug("Response Status: [%s]" % response["status"])

        if response["status"] == "ok":
            # A requisição foi bem sucedida
            job = response["jobs"][0]
            # Verificar o status_job:
            if job["job_status"] == "success":
                self.logger.info("DES Job finished and ready for download and registration.")

                return job

            elif job["job_status"] == "failure":
                # Neste caso o Job falhou na execução do lado do Descut, retorna erro e finaliza o job.
                self.logger.error("DES Job Finished with Descut Error: %s" % job["job_status_message"])

                raise Exception(job["job_status_message"])

            else:
                # Job nem terminou  com sucesso e nem falhou pode estar rodando ainda,
                # não fazer nada neste caso só logar uma mensagem de debug.
                self.logger.debug("Des Job status: [%s]" % job["job_status"])
                return None

        else:
            msg = "Error checking DES Job status: %s" % response["message"]
            self.logger.error(msg)

    def download_by_id(self, id):
        # Recupera o Model CutoutJob pelo id
        job = self.get_cutoutjobs_by_id(id)

        # Alterar o status para Downloading
        job.cjb_status = "dw"
        job.save()

        for desjob in job.desjob_set.filter(djb_status="success"):
            self.download_by_jobid(job.id, desjob.djb_jobid)

    def download_by_jobid(self, id, jobid):

        self.logger.info("Starting download Cutouts ID:[%s] Jobid [ %s ]" % (id, jobid))

        try:
            # Recupera o Model CutoutJob pelo id
            job = self.get_cutoutjobs_by_id(id)

            # Recupera o Model Desjob
            desjob = job.desjob_set.get(djb_jobid=jobid)

            config = settings.DESCUTOUT_SERVICE

            # Baixar o tar.gz com todos os dados
            filename = "{}.tar.gz".format(jobid)
            url = "{}/{}/cutout/{}".format(config["FILES_URL"], config["USERNAME"], filename)
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

        jobid = desjob.djb_jobid
        records = []

        # TODO: Remover esta Correção do erro de formato no JSON do DES.
        # afiles = cutout['FILES'].replace("[", "").replace("]", "").replace("\"", "").split(",")

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

        self.logger.debug(records)

        return records

    def extract_file(self, filepath, path):
        tar = tarfile.open(filepath)
        tar.extractall(path)
        tar.close()

    def on_success(self, id):
        # Recupera o Model CutoutJob pelo id
        job = self.get_cutoutjobs_by_id(id)

        # Guardar o tamanho total e a quantidade das imagens geradas.
        job.cjb_file_size = job.cutout_set.aggregate(sum_size=Sum('ctt_file_size')).get("sum_size")
        job.cjb_files = job.cutout_set.count()
        job.save()

        # TODO: Apagar Os Jobs no Descut

        # TODO: Enviar email de sucesso
        job.cjb_status = "ok"
        job.cjb_finish_time = datetime.utcnow().replace(tzinfo=utc)
        job.save()

    def on_error(self, id, error):
        trace = traceback.format_exc()
        self.logger.error(trace)
        self.logger.error(error)
        # TODO:
        # Alterar o status do Job
        # Alterar a data de termino
        # Alterar o campo de erro


# ----------------------------------------------///////////////////////////////////////////--------------------------------------------------

    def get_job_results(self, token, jobid):
        """
        Get Job Results : Mainly returns a list of links to files

        return
            links (string): quando o job termina com sucesso
            None: quando o job ainda nao terminou
            False: quando o job retorna com status failure
        """

        self.logger.info("Get Results for job %s" % jobid)

        # TODO Diferenca entre Colaboracao e DR1 Public talvez transformar em metodos diferentes.
        if self.api_version == 1:

            req = requests.get(
                self.host_check_jobs + "?token=" + token + "&jobid=" + jobid, verify=self.verify_ssl)

            self.logger.debug(req.text)

            data = req.json()

            if data["status"] != "error" and data["job_status"] == "SUCCESS":

                if "links" in data and data["links"] is not None:
                    self.logger.info("This job %s is finished and is ready to be downloaded" % jobid)

                    return data["links"]
                else:
                    # Nao retornou a lista de resultado
                    self.logger.warning("Descut returned success, but not the list of download links.")
                    return None

            elif data["status"] != "error" and data["job_status"] == "PENDING":
                # O job ainda nao terminou no servidor
                self.logger.info("This job %s is still running" % jobid)
                return None

            else:
                return False

        else:

            data = {
                "token": token,
                "jobid": jobid
            }
            req = requests.post(
                self.host_check_jobs,
                data=data,
                verify=self.verify_ssl,
            )

            self.logger.debug(req.text)

            data = req.json()

            if data["status"] != "error" and data["job_status"] == "SUCCESS":

                if "files" in data and data["files"] is not None:
                    self.logger.info("This job %s is finished and is ready to be downloaded" % jobid)

                    return data["files"]
                else:
                    # Nao retornou a lista de resultado
                    self.logger.warning("Descut returned success, but not the list of download links.")
                    return None

            elif data["status"] != "error" and data["job_status"] == "PENDING":
                # O job ainda nao terminou no servidor
                self.logger.info("This job %s is still running" % jobid)
                return None

            else:
                return False

    def delete_job_results(self, token, jobid):
        """
        Delete Jobs: Delete Job by its Id

        """
        self.logger.info("Deleting job %s in DesCutout service" % jobid)

        if self.api_version == 1 and self.delete_job_after_download is True:
            req = requests.delete(
                self.host_check_jobs + "?token=" + token + "&jobid=" + jobid, verify=self.verify_ssl)

            data = req.json()
            self.logger.debug(data)

            if data["status"] != "error" and data["status"] == "ok":
                self.logger.info("Deleted job!")

                return True
            else:
                return False
        else:
            return True

    def parse_result_url(self, url):
        """
        Divide uma url retornada pelo Des Cutout Service em um objeto
        Args:
            url: str()

        Returns:

        """
        arq = dict({
            "thumbname": None,
            "filename": None,
            "file_type": None,
            # "ra_sex": None,
            # "dec_sex": None,
            # "ra": None,
            # "dec": None,
            "filter": None,
            "url": url.strip()
        })

        # filename = ultima parte da url
        aurl = url.split("/")
        filename = aurl[len(aurl) - 1]
        arq.update({"filename": filename.strip()})

        # file_type extensao do arquivo
        file_type = filename.split(".")[len(filename.split(".")) - 1]
        arq.update({"file_type": file_type.strip()})

        if file_type not in self.not_images:
            # Filtro da Imagem.
            try:
                filter = filename.split("_")[1].split(".")[0]
                arq.update({"filter": filter.strip()})

                # thumbname = filename split _
                thumbname = filename.split("_")[0]
                arq.update({"thumbname": thumbname.strip()})

            except:
                # NAO TEM BANDA
                # TODO descobrir um jeito de saber quais as bandas usadas para imagem colorida

                thumbname = filename[0:21]
                arq.update({"thumbname": thumbname.strip()})

        return arq

    def start_job(self, job):

        product_id = job.cjb_product_id

        # Se o Estatus for Starting
        if job.cjb_status == "st":

            # Criando o token de acesso
            token = self.generate_token()
            self.logger.debug("Token: %s" % token)

            # Muda o Status para Before Submit
            self.change_cutoutjob_status(job, "bs")

            # Recupera os objetos do catalogo
            self.logger.info("Retrieving the objects to be sent")

            objects = self.get_catalog_objects(job)

            self.logger.info("There are %s objects to send" % objects.get("count"))

            # Comment, este comentario e visivel so na interface do descut
            comment = "Science Server Cutout Job Id: %s Product ID: %s" % (job.pk, product_id)

            data = dict({
                "job_type": job.cjb_job_type,
                "ra": objects.get("ra"),
                "dec": objects.get("dec"),
                "comment": comment,
            })

            # Params Obrigatorios para DR1 public version
            if self.api_version == 2:
                data.update({
                    "username": self.user,
                    "password": self.password,
                    "list_only": "false",
                    "email": self.email,
                    "jobname": comment
                })

            if job.cjb_xsize:
                data.update({"xsize": job.cjb_xsize})
            if job.cjb_ysize:
                data.update({"ysize": job.cjb_ysize})

            if job.cjb_job_type == "single":
                if job.cjb_band:
                    data.update({"band": job.cjb_band})
                if job.cjb_Blacklist:
                    data.update({"no_blacklist": "true"})
                else:
                    data.update({"no_blacklist": "false"})
            else:
                if job.cjb_tag:
                    data.update({"tag": job.cjb_tag})

            self.logger.debug("Data to be send coordinates:")
            self.logger.debug(pformat(data))

            # Submit a Job
            try:
                result = self.create_job(token, data)

                self.logger.info("Updating CutoutJob to keep job id returned")

                # Diferencas entre DR1 e Colaboracao
                jobid = None
                try:
                    jobid = result["job"]

                except:
                    jobid = result["jobid"]

                self.logger.debug("Job ID: %s" % jobid)

                job.cjb_job_id = str(jobid)
                job.save()

                # Changing the CutoutJob Status for Running
                self.change_cutoutjob_status(job, "rn")

                self.logger.info("Done! The new job was created successfully")

            except Exception as e:
                # Changing the CutoutJob Status for Error
                self.change_cutoutjob_status(job, "er")

                raise e
        else:
            msg = (
                "This cutoutjob %s can not be started because the current status '%s' is different from 'starting'" % (
                    job.pk, job.cjb_status))
            raise Exception(msg)

    def delete_job(self, cutoutjob):

        if cutoutjob.cjb_job_id is not None:
            token = self.generate_token()

            self.delete_job_results(token, cutoutjob.cjb_job_id)

    def get_cutoutjobs_by_status(self, status):

        # Pegar todos os CutoutJobs com status = st (Start)
        return CutOutJob.objects.filter(cjb_status=str(status))

    def change_cutoutjob_status(self, cutoutjob, status):
        self.logger.info("Changing the CutoutJob Status %s for %s" % (cutoutjob.cjb_status, status))
        cutoutjob.cjb_status = status
        cutoutjob.save()

    def check_jobs(self):
        """
        Verifica todos os jobs com status running
        """

        # Pegar todos os CutoutJobs com status running
        jobs = CutOutJob.objects.filter(cjb_status="rn")

        if jobs.count() > 0:
            self.logger.info("Check %s Jobs with status running" % jobs.count())

        # Faz um for para cara job
        for job in jobs:
            self.logger.info("Get Status for job %s" % job.pk)

            # Cria um Token
            token = self.generate_token()

            # Consulta o Job no servico
            list_files = self.get_job_results(token, job.cjb_job_id)

            if list_files is False:
                # Changing the CutoutJob Status for Error in the DesCutout side.
                self.change_cutoutjob_status(job, "je")
                break

            if list_files is not None:
                #  Path onde ficaram os arquivos de cutout
                cutoutdir = self.get_cutout_dir(job)

                # Guardar o Arquivo de resultado com os links a serem baixados
                result_file = self.save_result_links_file(job, list_files)

                job.cjb_results_file = result_file.split(self.data_dir)[1].strip("/")

                # Baixar o Arquivo Matched que sera usado para associar os arquivos baixados com os objetos.
                matched = None
                for link in list_files:
                    arq = self.parse_result_url(link)
                    if arq.get("file_type") == "csv" and arq.get("filename").find("matched") > -1:
                        matched = arq
                        break

                if matched is not None:
                    matched_file = Download().download_file_from_url(
                        matched.get("url"),
                        cutoutdir,
                        matched.get("filename"))

                    # Criar um arquivo associando os arquivos ao seu objeto
                    objects = self.get_objects_from_file(job)

                    with open(matched_file, "r") as matched_csv:
                        matched_reader = csv.DictReader(matched_csv)

                        for row in matched_reader:
                            key = self.get_object_position_key(row.get("RA"), row.get("DEC"))

                            for obj in objects:
                                if key == obj.get("key"):
                                    obj.update({"thumbname": row.get("THUMBNAME")})
                                    break

                    matched_csv.close()
                    job.cjb_matched_file = matched_file.split(self.data_dir)[1].strip("/")

                    # Escrever o novo arquivo de objetos com o nome do arquivo
                    with open(os.path.join(cutoutdir, "objects.csv"), "w") as new_objects_csv:
                        fieldnames = ["key", "id", "ra_original", "ra", "dec", "thumbname"]
                        writer = csv.DictWriter(new_objects_csv, fieldnames=fieldnames)
                        writer.writeheader()
                        for obj in objects:
                            print("Escrevendo o novo  objeto")
                            self.logger.debug(obj)
                            writer.writerow(obj)

                    new_objects_csv.close()

                job.cjb_cutouts_path = cutoutdir.split(self.data_dir)[1].strip("/")

                # Changing the CutoutJob Status for Before Download
                self.change_cutoutjob_status(job, "bd")

    def get_cutout_dir(self, cutout_job=None, product=None, jobid=None):
        """
        Criar um Diretorio agrupando os jobs de cutouts por produtos
        <product_id>/<cutout_job_id>/*

        Args:
            cutout_job: instancia do model CutoutJob
            OR
            product: chave pk do model Product em conjunto com
            jobid: chave pk do model CutoutJob

        Returns: str(<product_id>/<cutout_job_id>/)
        """
        try:
            if cutout_job is not None:
                cutout_dir = os.path.join(
                    self.data_dir,
                    self.cutout_dir,
                    str(cutout_job.cjb_product_id),
                    str(cutout_job.id))
            else:
                cutout_dir = os.path.join(
                    self.data_dir,
                    self.cutout_dir,
                    str(product),
                    str(jobid))

            os.makedirs(cutout_dir)
            return cutout_dir

        except OSError:
            # Cutout path already exists
            return cutout_dir

    def save_result_links_file(self, cutoutjob, links):
        self.logger.info("Save result links to a file")

        cutoutdir = self.get_cutout_dir(cutoutjob)
        f = os.path.join(cutoutdir, self.result_file)

        with open(f, "w") as result:
            for l in links:
                result.write(l + "\n")

            result.close()

        self.logger.debug("Result File %s" % f)
        return f

    # def get_catalog_objects(self, job):
    #     product_id = job.cjb_product_id
    #     cutoutdir = self.get_cutout_dir(job)
    #     catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

    #     # colunas associadas ao produto
    #     associations = Association().get_associations_by_product_id(product_id)

    #     # Criar uma lista de colunas baseda nas associacoes isso para limitar a query de nao usar *
    #     columns = Association().get_properties_associated(product_id)

    #     catalog_db = CatalogObjectsDBHelper(
    #         catalog.tbl_name,
    #         schema=catalog.tbl_schema,
    #         database=catalog.tbl_database
    #     )

    #     rows, count = catalog_db.query(
    #         columns=columns,
    #         limit=self.cutout_max_objects
    #     )

    #     # Criar um arquivo que servira de index para a associar os objetos as imagens

    #     # Lista de Ra e dec que serao passadas como parametro
    #     lra = list()
    #     ldec = list()

    #     with open(os.path.join(cutoutdir, "objects.csv"), "w") as objects_csv:
    #         fieldnames = ["key", "id", "ra_original", "ra", "dec"]
    #         writer = csv.DictWriter(objects_csv, fieldnames=fieldnames)
    #         writer.writeheader()

    #         for row in rows:
    #             ra_original = float(row.get(associations.get("pos.eq.ra;meta.main")))
    #             ra = ra_original
    #             dec = float(row.get(associations.get("pos.eq.dec;meta.main")))

    #             if ra < 0 and ra > -180:
    #                 ra = ra + 360

    #             obj = dict({
    #                 "id": row.get(associations.get("meta.id;meta.main")),
    #                 "ra_original": ra_original,
    #                 "ra": ra,
    #                 "dec": dec,
    #                 "key": str(self.get_object_position_key(ra, dec))
    #             })

    #             writer.writerow(obj)

    #             lra.append(ra)
    #             ldec.append(dec)

    #     objects_csv.close()

    #     return dict({
    #         "ra": str(lra),
    #         "dec": str(ldec),
    #         "count": len(rows)
    #     })

    def get_objects_from_file(self, cutoutjob):
        cutoutdir = self.get_cutout_dir(cutoutjob)
        objects = list()
        with open(os.path.join(cutoutdir, "objects.csv"), "r") as objects_csv:
            objects_reader = csv.DictReader(objects_csv)
            for object in objects_reader:
                objects.append(object)
        objects_csv.close()

        return objects

    def get_object_position_key(self, ra, dec):
        """
        Monta uma chave usando ra e dec do objeto
        Args:
            ra: float() com 3 casas decimais
            dec: float() com 3 casas decimais

        Returns: string() ra+dec ou ra-dec
        """
        ra = float("{:6.3f}".format(float(ra)))
        dec = float("{:6.3f}".format(float(dec)))

        # montar uma chave usando ra dec
        key = str(ra)
        if float(dec) > 0:
            key += "+" + str(dec)
        else:
            key += str(dec)

        return key

    # def create_cutout_model(self,
    #                         cutoutjob, filename, thumbname, type, filter=None, object_id=None, object_ra=None,
    #                         object_dec=None, file_path=None, file_size=None, start=None, finish=None):

    #     # Tratamento do file_path para remover o path absoluto guardando apenas o path configurado no settings cutoutdir
    #     if file_path is not None:
    #         file_path = file_path.split(self.cutout_dir)[1]
    #         file_path = os.path.join(self.cutout_dir, file_path.strip('/'))

    #     # Tratar Ra e Dec para 5 casas decimais
    #     if object_ra is not None:
    #         object_ra = float('%.5f' % float(object_ra))

    #     if object_dec is not None:
    #         object_dec = float('%.5f' % float(object_dec))

    #     try:

    #         cutout, created = Cutout.objects.update_or_create(
    #             cjb_cutout_job=cutoutjob,
    #             ctt_file_name=filename,
    #             ctt_file_type=type,
    #             ctt_filter=filter,
    #             ctt_object_id=object_id,
    #             ctt_object_ra=object_ra,
    #             ctt_object_dec=object_dec,
    #             defaults={
    #                 "ctt_file_size": file_size,
    #                 "ctt_file_path": file_path,
    #                 "ctt_thumbname": thumbname,
    #                 "ctt_download_start_time": start,
    #                 "ctt_download_finish_time": finish
    #             }
    #         )

    #         self.logger.debug("Cutout ID %s Registred" % cutout.pk)
    #         return cutout

    #     except Exception as e:
    #         self.logger.error(e)

    #         # Changing the CutoutJob Status for Error
    #         self.change_cutoutjob_status(cutoutjob, "er")

    #         raise (e)


class CutoutJobNotify:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

    def create_email_message(self, cutoutjob):

        if cutoutjob.owner.email:
            to_email = cutoutjob.owner.email

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

            if cutoutjob.cutout_set.count():
                sum_sizes = cutoutjob.cutout_set.aggregate(sum_size=Sum('ctt_file_size'))
                files_size = humanize.naturalsize(sum_sizes.get("sum_size"))

            tdelta = finish - start
            seconds = tdelta.total_seconds()
            execution_time = str(timedelta(seconds=seconds)).split('.')[0]
            execution_time_humanized = humanize.naturaldelta(timedelta(seconds=seconds))

            image_formats = cutoutjob.cjb_image_formats
            if image_formats is None:
                image_formats = 'png'

            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
                "cutoutjob_type:": cutoutjob.cjb_job_type,
                "cutoutjob_tag": tag,
                "cutoutjob_xsize": int((float(cutoutjob.cjb_xsize) * 60)),  # converter para arcsec
                "cutoutjob_ysize": int((float(cutoutjob.cjb_ysize) * 60)),
                "cutoutjob_image_formats": image_formats,
                "n_objects": cutoutjob.cjb_product.table.catalog.ctl_num_objects,
                "n_files": cutoutjob.cutout_set.count(),
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

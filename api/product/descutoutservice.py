import csv
import datetime
import logging
import os
from pprint import pformat

import humanize
import requests
from common.download import Download
from common.notify import Notify
from django.conf import settings
from django.db.models import Sum
from django.template.loader import render_to_string
from django.utils import timezone
from lib.CatalogDB import CatalogObjectsDBHelper
from product.association import Association
from product.models import Catalog
from product.models import CutOutJob
from product.models import Cutout


class DesCutoutService:
    db = None

    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

        self.logger.info("Start!")

        self.logger.info("Retrieving settings for des cutout service")

        try:
            params = settings.DES_CUTOUT_SERVICE
            # self.logger.debug(params)

            self.host = params["HOST"]
            self.user = params["USER"]
            self.password = params["PASSWORD"]

            self.check_jobs_task_delay = params["CUTOUT_TASK_CHECK_JOBS_DELAY"]

            # Diretorio raiz onde ficaram as imagens do cutout
            self.data_dir = settings.DATA_DIR
            self.cutout_dir = params["CUTOUT_DIR"]

        except Exception as e:
            msg = ("Error in the Cutouts parameters in the settings. "
                   "Check the DES_CUTOUT_SERVICE section if it is configured correctly. ERROR: %s" % e)
            raise Exception(msg)

        self.host_token = self.host + "/api/token/"
        self.host_jobs = self.host + "/api/jobs/"

        self.logger.debug("host_token: %s" % self.host_token)
        self.logger.debug("host_jobs: %s" % self.host_jobs)

        # Tipos de arquivos recebidos que nao sao imagens
        self.not_images = ["log", "csv", "stifflog"]

        # Nome do arquivo de resultados
        self.result_file = "result_file.txt"

        # fazer os request sem verificar o certificado SSL / HTTPS
        self.verify_ssl = False


        # TODO ter uma lista com as bandas para usar na associacao
        # self.filters = dict({})
        # filters = Filter.objects.all()
        # for f in filters:
        #     self.filter.update({f.filter:f.pk})

    def generate_token(self):
        """
        Returns a token to create other requests
        Returns: str(token)
        """
        self.logger.info("Generating a new Authentication token")

        # Create Authetication Token
        req = requests.post(
            self.host_token,
            data={
                "username": self.user,
                "password": self.password
            },
            verify=self.verify_ssl)

        try:
            self.logger.debug(req.text)

            return req.json()["token"]
        except Exception as e:
            text = req.json()
            msg = ("Token generation error %s - %s" % (req.status_code, text["message"]))

            self.logger.critical(msg)
        raise Exception(msg)

    def check_token_status(self, token):
        """
        Check Token status: Check the expiration time for a token
        Returns: bool()
        """
        # print("Check the expiration time for a token")
        req = requests.get(
            self.host_token + "?token=" + token, verify=self.verify_ssl)

        if req.json()["status"].lower() == "ok":
            return True
        else:
            return False

    def create_job(self, token, data):
        """
        Submit a Job to service
            :param token:
            :param data: {
                "token"        : "aaa...",          # required
                "ra"           : str(ra),           # required
                "dec"          : str(dec),          # required
                "job_type"     : "coadd",           # required "coadd" or "single"
                "comment"      : "String"           # required Adicionado em 09/2017
                "xsize"        : str(xs),           # optional (default : 1.0)
                "ysize"        : str(ys),           # optional (default : 1.0)
                "tag"          : "Y3A1_COADD",      # optional for "coadd" jobs (default: Y3A1_COADD, see Coadd Help page for more options)
                "band"         : "g,r,i",           # optional for "single" epochs jobs (default: all bands)
                "no_blacklist" : "false",           # optional for "single" epochs jobs (default: "false"). return or not blacklisted exposures
                "list_only"    : "false",           # optional (default : "false") "true": will not generate pngs (faster)
                "email"        : "myemail@mmm.com"  # optional will send email when job is finished
            }
        """
        self.logger.info("Sending request to create a new job in the Service")

        data["token"] = token

        self.logger.debug("Host Jobs: %s" % self.host_jobs)

        req = requests.post(
            self.host_jobs,
            data=data,
            verify=self.verify_ssl
        )

        self.logger.debug(req)

        try:
            if req.json()["status"] == "ok":
                self.logger.debug("Req: %s" % req.json())

                return req.json()

            else:
                msg = ("Create Job Error: " % req.json()["message"])
                raise Exception(msg)

        except Exception as e:
            msg = ("Request Create Job error %s - %s" % (req.status_code, req.text))

            raise Exception(msg)

    def get_job_results(self, token, jobid):
        """
        Get Job Results : Mainly returns a list of links to files

        return
            links (string): quando o job termina com sucesso
            None: quando o job ainda nao terminou
            False: quando o job retorna com status failure
        """
        req = requests.get(
            self.host_jobs + "?token=" + token + "&jobid=" + jobid, verify=self.verify_ssl)

        self.logger.info("Get Results for job %s" % jobid)

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

    def delete_job_results(self, token, jobid):
        """
        Delete Jobs: Delete Job by its Id

        """
        self.logger.info("Deleting job %s in DesCutout service" % jobid)
        req = requests.delete(
            self.host_jobs + "?token=" + token + "&jobid=" + jobid, verify=self.verify_ssl)

        data = req.json()
        self.logger.debug(data)

        if data["status"] != "error" and data["status"] == "ok":
            self.logger.info("Deleted job!")

            return True
        else:
            return False

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

            data = {
                "job_type": job.cjb_job_type,
                "ra": objects.get("ra"),
                "dec": objects.get("dec"),
                "comment": comment
            }
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

                self.logger.info(result["message"])

                self.logger.info("Updating CutoutJob to keep job id returned")

                self.logger.debug("Job ID: %s" % result["job"])

                job.cjb_job_id = str(result["job"])
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

    def start_job_by_id(self, id):
        self.logger.info("Des Cutout Start Job by ID %s" % id)

        # Recupera o Model CutoutJob pelo id
        try:
            cutoutjob = self.get_cutoutjobs_by_id(id)

            self.logger.debug("CutoutJob Name: %s" % cutoutjob.cjb_display_name)

            # Notificacao por email
            CutoutJobNotify().create_email_message(cutoutjob)

            self.start_job(cutoutjob)

        except CutOutJob.DoesNotExist as e:
            self.logger.critical(e)
            raise e

        except Exception as e:
            self.logger.critical(e)
            raise e

    def start_jobs(self):
        self.logger.info("Des Cutout Start Jobs with status is 'starting'")

        # Recuperar a lista de jobs com o status "st"
        cutoutjobs = self.get_cutoutjobs_by_status("st")

        self.logger.info("There are %s CutoutJobs to start" % len(cutoutjobs))

        for job in cutoutjobs:
            # TODO chamar o metodo start_job
            pass

    def delete_job(self, cutoutjob):
        if cutoutjob.cjb_job_id is not None:
            token = self.generate_token()

            self.delete_job_results(token, cutoutjob.cjb_job_id)

    def get_cutoutjobs_by_status(self, status):

        # Pegar todos os CutoutJobs com status = st (Start)
        return CutOutJob.objects.filter(cjb_status=str(status))

    def get_cutoutjobs_by_id(self, id):
        return CutOutJob.objects.get(pk=int(id))

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
                        fieldnames = ["key", "id", "ra", "dec", "thumbname"]
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

    def get_catalog_objects(self, job):
        product_id = job.cjb_product_id
        cutoutdir = self.get_cutout_dir(job)
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        # colunas associadas ao produto
        associations = Association().get_associations_by_product_id(product_id)

        # Criar uma lista de colunas baseda nas associacoes isso para limitar a query de nao usar *
        columns = Association().get_properties_associated(product_id)

        catalog_db = CatalogObjectsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database
        )

        rows, count = catalog_db.query(
            columns=columns,
            limit=100
        )

        # Criar um arquivo que servira de index para a associar os objetos as imagens

        # Lista de Ra e dec que serao passadas como parametro
        lra = list()
        ldec = list()

        with open(os.path.join(cutoutdir, "objects.csv"), "w") as objects_csv:
            fieldnames = ["key", "id", "ra", "dec"]
            writer = csv.DictWriter(objects_csv, fieldnames=fieldnames)
            writer.writeheader()

            for row in rows:

                ra = float(row.get(associations.get("pos.eq.ra;meta.main")))
                dec = float(row.get(associations.get("pos.eq.dec;meta.main")))


                obj = dict({
                    "id": row.get(associations.get("meta.id;meta.main")),
                    "ra": ra,
                    "dec": dec,
                    "key": str(self.get_object_position_key(
                        row.get(associations.get("pos.eq.ra;meta.main")),
                        row.get(associations.get("pos.eq.dec;meta.main"))))
                })

                writer.writerow(obj)

                lra.append(ra)
                ldec.append(dec)

        objects_csv.close()

        return dict({
            "ra": str(lra),
            "dec": str(ldec),
            "count": len(rows)
        })

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

    def test_api_help(self):
        print("-------------- test_api_help --------------")
        token = self.generate_token()

        ra = [10.0, 20.0, 30.0]
        dec = [40.0, 50.0, 60.0]
        xs = [1.0, 2.0, 3.0, 4.0]
        ys = [2.0]

        # create body of request
        body = {
            "token": token,  # required
            "ra": str(ra),  # required
            "dec": str(dec),  # required
            "job_type": "coadd",  # required "coadd" or "single"
            "xsize": str(xs),  # optional (default : 1.0)
            "ysize": str(ys),  # optional (default : 1.0)
            "band": "g,r,i",  # optional for "single" epochs jobs (default: all bands)
            "no_blacklist": "false",
            # optional for "single" epochs jobs (default: "false"). return or not blacklisted exposures
            "list_only": "false",  # optional (default : "false") "true": will not generate pngs (faster)
            "email": "false"  # optional will send email when job is finished
        }

        req = requests.post("http://descut.cosmology.illinois.edu/api/jobs/", data=body, verify=self.verify_ssl)

        # create body for files if needed
        # body_files = {"csvfile": open("mydata.csv", "rb")}  # To load csv file as part of request
        # To include files
        # req = requests.post("http://descut.cosmology.illinois.edu/api/jobs/", data=body, files=body_files)

        print(req)
        print(req.text)
        print(req.json()["job"])

    def create_cutout_model(self,
                            cutoutjob, filename, thumbname, type, filter=None, object_id=None, object_ra=None,
                            object_dec=None, file_path=None, file_size=None, start=None, finish=None):

        # Tratamento do file_path para remover o path absoluto guardando apenas o path configurado no settings cutoutdir
        if file_path is not None:
            file_path = file_path.split(self.cutout_dir)[1]
            file_path = os.path.join(self.cutout_dir, file_path.strip('/'))

        cutout, created = Cutout.objects.update_or_create(
            cjb_cutout_job=cutoutjob,
            ctt_file_name=filename,
            ctt_file_type=type,
            ctt_filter=filter,
            ctt_object_id=object_id,
            ctt_object_ra=object_ra,
            ctt_object_dec=object_dec,
            defaults={
                "ctt_file_size": file_size,
                "ctt_file_path": file_path,
                "ctt_thumbname": thumbname,
                "ctt_download_start_time": start,
                "ctt_download_finish_time": finish
            }
        )

        self.logger.debug("Cutout ID %s Registred" % cutout.pk)
        return cutout

class CutoutJobNotify:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

    def send_email(self, subject, body, to):

        self.logger.info("Sending mail notification.")

        Notify().send_email(subject, body, to)

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

            elif cutoutjob.cjb_status == 'je':
                subject = "Mosaic Failed"
                message = self.generate_failure_email(cutoutjob)

            if message:
                self.send_email(subject, message, to_email)

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
            execution_time = str(datetime.timedelta(seconds=seconds)).split('.')[0]
            execution_time_humanized = humanize.naturaldelta(datetime.timedelta(seconds=seconds))

            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
                "cutoutjob_type:": cutoutjob.cjb_job_type,
                "cutoutjob_tag": tag,
                "cutoutjob_xsize": int((float(cutoutjob.cjb_xsize) * 60)),  # converter para arcsec
                "cutoutjob_ysize": int((float(cutoutjob.cjb_ysize) * 60)),
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
            execution_time_humanized = humanize.naturaldelta(datetime.timedelta(seconds=seconds))

            context = dict({
                "username": cutoutjob.owner.username,
                "target_display_name": cutoutjob.cjb_product.prd_display_name,
                "cutoutjob_display_name": cutoutjob.cjb_display_name,
                "execution_time_humanized": execution_time_humanized
            })

            return render_to_string("cutout_notification_error.html", context)

        except Exception as e:
            self.logger.error(e)

import os

import shutil
import urllib
from django.utils import timezone
from pprint import pprint, pformat

from coadd.models import Release, Tag
from common.models import Filter
from product.models import Catalog, Map, Mask, ProductContent, ProductRelease, ProductTag, ProductContentAssociation
from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ProcessRelease
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q
from django.conf import settings
import requests
from product.models import CutOutJob
from product.models import Cutout
from common.models import Filter
from product.serializers import AssociationSerializer
from os import mkdir, path
import csv
from .views_db import CutoutJobsDBHelper
import logging


class DesCutoutService:
    db = None

    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("descutoutservice")

        self.logger.info("Start!")

        self.logger.info("Retrieving settings for des cutout service")

        params = settings.DES_CUTOUT_SERVICE

        self.logger.debug(params)

        # TODO checar se existem os parametros no settings.

        self.host = params["HOST"]
        self.user = params["USER"]
        self.password = params["PASSWORD"]

        # Diretorio raiz onde ficaram as imagens do cutout
        self.cutout_dir = params["CUTOUT_DIR"]

        self.host_token = self.host + "/api/token/"
        self.host_jobs = self.host + "/api/jobs/"

        self.logger.debug("host_token: %s" % self.host_token)
        self.logger.debug("host_jobs: %s" % self.host_jobs)

        # Tipos de arquivos recebidos que nao sao imagens
        self.not_images = ["log", "csv", "stifflog"]

        # Nome do arquivo de resultados
        self.result_file = "result_file.txt"

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
            })

        try:
            self.logger.debug(req.json())

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
            self.host_token + "?token=" + token)

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

        req = requests.post(
            self.host_jobs,
            data=data)

        self.logger.debug(req.json())

        try:
            if req.json()["status"] == "ok":
                return req.json()

            else:
                msg = ("Create Job Error: " % req.json()["message"])
                raise Exception(msg)

        except Exception as e:
            text = req.json()
            msg = ("Request Create Job error %s - %s" % (req.status_code, text["message"]))

            raise Exception(msg)

    def get_job_results(self, token, jobid):
        """
        Get Job Results : Mainly returns a list of links to files

        """
        req = requests.get(
            self.host_jobs + "?token=" + token + "&jobid=" + jobid)

        self.logger.info("Get Results for job %s" % jobid)

        # print(req.text)
        data = req.json()

        if data["status"] != "error" and data["job_status"] == "SUCCESS":
            self.logger.info("This job %s is finished and is ready to be downloaded" % jobid)

            return data["links"]

        elif data["status"] != "error" and data["job_status"] == "PENDING":
            # O job ainda nao terminou no servidor
            self.logger.info("This job %s is still running" % jobid)

        else:
            return False

    def delete_job_results(self, token, jobid):
        """
        Delete Jobs: Delete Job by its Id

        """
        req = requests.delete(
            self.host_jobs + "?token=" + token + "&jobid=" + jobid)

        # print(req.text)
        data = req.json()

        if data["status"] != "error" and data["status"] == "ok":
            # print(data["message"])
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

            data = {
                "job_type": job.cjb_job_type,
                "ra": objects.get("ra"),
                "dec": objects.get("dec"),
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

            self.logger.debug("Data to be send coordinates: %s" % pformat(data))

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
            cutoutjob = CutOutJob.objects.get(pk=int(id))

            self.logger.debug("CutoutJob Name: %s" % cutoutjob.cjb_display_name)

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
            # print("Job: %s" % job.cjb_job_id)
            self.logger.info("Get Status for job %s" % job.pk)

            # Cria um Token
            token = self.generate_token()

            # Consulta o Job no servico
            list_files = self.get_job_results(token, job.cjb_job_id)

            if list_files is None:
                break

            elif list_files is False:
                # Changing the CutoutJob Status for Error in the DesCutout side.
                self.change_cutoutjob_status(job, "je")

                break

            else:
                # Guardar o Arquivo de resultado com os links a serem baixados
                result_file = self.save_result_links_file(job, list_files)
                job.cjb_results_file = result_file

                # Baixar o Arquivo Matched que sera usado para associar os arquivos baixados com os objetos.
                matched = None
                for link in list_files:
                    arq = self.parse_result_url(link)
                    if arq.get("file_type") == "csv" and arq.get("filename").find("matched") > -1:
                        matched = arq
                        break

                if matched is not None:
                    cutoutdir = self.get_cutout_dir(job)
                    print(matched)
                    matched_file = self.download_file(matched.get("url"), cutoutdir, matched.get("filename"))

                    job.cjb_matched_file = matched_file

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

                # Changing the CutoutJob Status for Before Download
                self.change_cutoutjob_status(job, "bd")

    def get_cutout_dir(self, cutout_job):
        """
        Criar um Diretorio agrupando os jobs de cutouts por produtos
        <product_id>/<cutout_job_id>/*

        Args:
            cutout_job:

        Returns: str(<product_id>/<cutout_job_id>/)

        """
        cutout_dir = os.path.join(
            self.cutout_dir, str(cutout_job.cjb_product_id), str(cutout_job.id))

        try:
            os.makedirs(cutout_dir)
            return cutout_dir

        except OSError:
            # Cutout path already exists
            return cutout_dir

    def download_file(self, url, cutout_dir, filename):
        self.logger.info("Downloading File %s From %s" % (filename, url))

        file_path = os.path.join(cutout_dir, filename)

        if not os.path.exists(file_path):
            urllib.request.urlretrieve(url, file_path)
            size = os.path.getsize(file_path)

            self.logger.info("Downloading Done! File: %s Size: %s bytes" % (file_path, size))
        else:
            self.logger.debug("File %s exists" % filename)

        return file_path

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
        # print("get_catalog_objects(product_id=%s)" % product_id)

        product_id = job.cjb_product_id
        cutoutdir = self.get_cutout_dir(job)
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data

        properties = dict()
        for property in associations:
            if property.get("pcc_ucd"):
                properties.update({property.get("pcc_ucd"): property.get("pcn_column_name")})

        db_helper = CutoutJobsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database)

        rows = db_helper.query_result(properties)

        # Criar um arquivo que servira de index para a associar os objetos as imagens

        # Lista de Ra e dec que serao passadas como parametro
        lra = list()
        ldec = list()

        with open(os.path.join(cutoutdir, "objects.csv"), "w") as objects_csv:
            fieldnames = ["key", "id", "ra", "dec"]
            writer = csv.DictWriter(objects_csv, fieldnames=fieldnames)
            writer.writeheader()

            objects = list()
            for row in rows:
                obj = dict({
                    "id": row.get(properties.get("meta.id;meta.main")),
                    "ra": row.get(properties.get("pos.eq.ra;meta.main")),
                    "dec": row.get(properties.get("pos.eq.dec;meta.main")),
                    "key": str(self.get_object_position_key(
                        row.get(properties.get("pos.eq.ra;meta.main")),
                        row.get(properties.get("pos.eq.dec;meta.main"))))
                })

                writer.writerow(obj)

                lra.append(float(obj.get("ra")))
                ldec.append(float(obj.get("dec")))

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

        req = requests.post("http://descut.cosmology.illinois.edu/api/jobs/", data=body)

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

        cutout, created = Cutout.objects.update_or_create(
            cjb_cutout_job=cutoutjob,
            ctt_file_name=filename,
            ctt_file_type=type,
            ctt_filter=filter,
            ctt_object_id=object_id,
            ctt_object_ra=object_ra,
            ctt_object_dec=object_dec,
            ctt_file_path=file_path,
            ctt_file_size=file_size,
            defaults={
                "ctt_thumbname": thumbname,
                "ctt_download_start_time": start,
                "ctt_download_finish_time": finish
            }
        )

        self.logger.debug("Cutout ID %s Registred" % cutout.pk)
        return cutout

# def sextodec(xyz, delimiter=None):
#     """Decimal value from numbers in sexagesimal system.
#     The input value can be either a floating point number or a string
#     such as "hh mm ss.ss" or "dd mm ss.ss". Delimiters other than " "
#     can be specified using the keyword ``delimiter``.
#     """
#     divisors = [1, 60.0, 3600.0]
#
#     xyzlist = str(xyz).split(delimiter)
#
#     sign = 1
#
#     if "-" in xyzlist[0]:
#         sign = -1
#
#     xyzlist = [abs(float(x)) for x in xyzlist]
#
#     decimal_value = 0
#
#     for i, j in zip(xyzlist, divisors):  # if xyzlist has <3 values then
#         # divisors gets clipped.
#         decimal_value += i / j
#
#     decimal_value = -decimal_value if sign == -1 else decimal_value
#
#     return decimal_value

import os

import shutil
import urllib
from django.utils import timezone
from pprint import pprint

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
from .models import CutOutJob
from .models import Cutout
from common.models import Filter
from product.serializers import AssociationSerializer
from os import mkdir, path
import csv
from .views_db import CutoutJobsDBHelper

class CutoutJobs:
    db = None

    def __init__(self):
        # TODO substituir os prints por LOG
        # print("--------- Init ----------")
        self.host = settings.CUTOUT_HOST
        self.user = settings.CUTOUT_USER
        self.password = settings.CUTOUT_PASSWORD

        # Diretorio raiz onde ficaram as imagens do cutout
        self.cutout_root = settings.CUTOUT_ROOT

        # TODO Checar se o diretorio cutout_root existe se tem permissao e se foi setado no settings
        # # Checar o Diretorio Raiz
        # if os.path.exists(self.cutout_root):
        #
        # else:

        self.host_token = self.host + '/api/token/'
        self.host_jobs = self.host + '/api/jobs/'

        # Tipos de arquivos recebidos que nao sao imagens
        self.not_images = ['log', 'csv', 'stifflog']

    def generate_token(self):
        """
        Returns a token to create other requests
        Returns: str(token)
        """
        # print("Create Authetication Token")
        # Create Authetication Token
        req = requests.post(
            self.host_token,
            data={
                'username': self.user,
                'password': self.password
            })

        return req.json()['token']

    def check_token_status(self, token):
        """
        Check Token status: Check the expiration time for a token
        Returns: bool()
        """
        # print("Check the expiration time for a token")
        req = requests.get(
            self.host_token + '?token=' + token)

        # print(req.json()['message'])

        if req.json()['status'].lower() == 'ok':
            return True
        else:
            return False

    def get_job_results(self, token, jobid):
        """
        Get Job Results : Mainly returns a list of links to files

        """
        req = requests.get(
            self.host_jobs + "?token=" + token + '&jobid=' + jobid)

        # print(req.text)
        data = req.json()

        if data['status'] != 'error' and data['job_status'] == 'SUCCESS':

            return data['links']
        elif data['status'] != 'error' and data['job_status'] == 'PENDING':
            # O job ainda nao terminou no servidor
            pass
        else:
            return False

    def delete_job_results(self, token, jobid):
        """
        Delete Jobs: Delete Job by its Id

        """
        req = requests.delete(
            self.host_jobs + "?token=" + token + '&jobid=' + jobid)

        # print(req.text)
        data = req.json()

        if data['status'] != 'error' and data['status'] == 'ok':
            # print(data['message'])
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
            "ra_sex": None,
            "dec_sex": None,
            "ra": None,
            "dec": None,
            "filter": None,
            "url": url
        })

        # filename = ultima parte da url
        aurl = url.split('/')
        filename = aurl[len(aurl) - 1]
        arq.update({"filename": filename})

        # file_type extensao do arquivo
        file_type = filename.split('.')[len(filename.split('.')) - 1]
        arq.update({"file_type": file_type})

        if file_type not in self.not_images:
            # recuperar a coordenada no nome do arquivo em sexagenal
            raDecList = filename[+4:].split('.')
            raDecList[0] = raDecList[0] + '.' + raDecList[1][-1:]
            raDecList[1] = raDecList[1][+1:] + '.' + raDecList[2]
            ra_sex = raDecList[0][:+2] + ' ' + raDecList[0][+2:][:+2] + ' ' + raDecList[0][+4:]
            dec_sex = raDecList[1][:+3] + ' ' + raDecList[1][+3:][:+2] + ' ' + raDecList[1][+5:].split("_")[0]

            arq.update({
                "ra_sex": ra_sex,
                "dec_sex": dec_sex,
            })
            #  Converter a coordenada que esta no filename para degrees
            ra = sextodec(ra_sex) * 15
            dec = sextodec(dec_sex)
            arq.update({
                "ra": float("{:6.3f}".format(ra)),
                "dec": float("{:6.3f}".format(dec)),
            })

            # Filtro da Imagem.
            try:
                filter = filename.split('_')[1].split('.')[0]
                arq.update({"filter": filter})

                # thumbname = filename split _
                thumbname = filename.split('_')[0]
                arq.update({"thumbname": thumbname})

            except:
                # NAO TEM BANDA
                # TODO descobrir um jeito de saber quais as bandas usadas para imagem colorida

                thumbname = filename[0:21]
                arq.update({"thumbname": thumbname})

        return arq

    def start_job(self):
        # print ("Start Job")

        # print(self.host)
        # Pegar todos os CutoutJobs com status = st (Start)
        cutoutjobs = CutOutJob.objects.filter(cjb_status='st')

        # print("Jobs: %s" % cutoutjobs.count())

        # Faz um for para cara job
        for job in cutoutjobs:
            # print(job.cjb_status)

            product_id = job.cjb_product_id

            token = self.generate_token()

            # muda Status para Before Submit status
            if job.cjb_status == 'st':
                CutOutJob.objects.filter(pk=job.pk).update(cjb_status='bs')

            # Recupera os objetos do catalogo
            rows = self.get_catalog_objects(product_id)

            ra = list()
            dec = list()
            for row in rows:
                ra.append(float(row['_meta_ra']))
                dec.append(float(row['_meta_dec']))

            body = {
                'token': token,
                'ra': str(ra),
                'dec': str(dec),
                'job_type': job.cjb_job_type
            }
            if job.cjb_xsize:
                body.update({'xsize': job.cjb_xsize})
            if job.cjb_ysize:
                body.update({'ysize': job.cjb_ysize})

            if job.cjb_job_type == 'single':
                if job.cjb_band:
                    body.update({'band': job.cjb_band})
                if job.cjb_Blacklist:
                    body.update({'no_blacklist': 'true'})
                else:
                    body.update({'no_blacklist': 'false'})

            # Faz o Submit pro serviço do NCSA
            req = requests.post(
                self.host_jobs, data=body)

            # muda o status pra enviado e inclui o retorno do submit
            if req.json()['status'] == 'ok':
                CutOutJob.objects.filter(pk=job.pk).update(cjb_job_id=req.json()['job'])

                CutOutJob.objects.filter(pk=job.pk).update(cjb_status='rn')

            else:
                CutOutJob.objects.filter(pk=job.pk).update(cjb_status='er')

        return ({"status": "ok"})

    def check_job(self):
        """
        Verifica todos os jobs com status running
        """
        # print("---------- check_job ----------------")

        # Pegar todos os CutoutJobs com status running
        jobs = CutOutJob.objects.filter(cjb_status='rn')

        # print('Count: %s' % jobs.count())

        # Faz um for para cara job
        for job in jobs:
            # print("Job: %s" % job.cjb_job_id)

            # Cria um Token
            token = self.generate_token()

            # Consulta o Job no servico
            list_files = self.get_job_results(token, job.cjb_job_id)

            if list_files is None:
                break
            elif list_files is False:
                # job com error no lado do servidor
                job.cjb_status = 'je'
                job.save()
                break

            # Download Files
            self.download_cutouts(job, list_files)

            # Apagar na API descut o job que já foi baixado
            # self.delete_job_results(token, job.cjb_job_id)

        return ({"status": "ok"})

    def get_cutout_dir(self, cutout_job):
        """
        Criar um Diretorio agrupando os jobs de cutouts por produtos
        <product_id>/<cutout_job_id>/*

        Args:
            cutout_job:

        Returns: str(<product_id>/<cutout_job_id>/)

        """
        cutout_dir = os.path.join(
            self.cutout_root, str(cutout_job.cjb_product_id), str(cutout_job.id))

        try:
            os.makedirs(cutout_dir)
            return cutout_dir

        except OSError:
            return cutout_dir
            # print("Cutout path already exists: %s" % cutout_dir)
            # raise

    def download_cutouts(self, cutout_job, list_files):
        # print("----------- download_cutouts -------------------")

        cutout_dir = self.get_cutout_dir(cutout_job)

        # Verificar se tem um csv com o nome dos arquivos e as coordenadas
        # print('Cutout_Dir: %s' % cutout_dir)

        matched_csv = None

        for url in list_files:
            arq = self.parse_result_url(url)

            # Se os arquivos sao imagens
            if arq.get('file_type') not in self.not_images:

                # Criar uma instancia cutout

                image_filter = None
                if arq.get('filter') is not None:
                    image_filter = Filter.objects.get(filter__iexact=arq.get('filter'))

                cutout, created = Cutout.objects.update_or_create(
                    cjb_cutout_job=cutout_job,
                    ctt_filter=image_filter,
                    ctt_file_name=arq.get('filename'),
                    ctt_file_type=arq.get('file_type'),
                    defaults={
                        "ctt_thumbname": arq.get('thumbname'),
                        "ctt_download_start_time": timezone.now()
                    }
                )

                # Download do arquivo
                file_path = self.download_file(arq.get('url'), cutout_dir, arq.get('filename'))

                # Tamanho do arquivo baixado
                file_size = os.path.getsize(file_path)

                # Atualizar o registro de cutout
                cutout.ctt_file_path = file_path
                cutout.ctt_file_size = file_size
                cutout.ctt_download_finish_time = timezone.now()

                cutout.save()

            elif arq.get('file_type') == "csv":
                # Se o arquivo for csv
                matched_csv = self.download_file(arq.get('url'), cutout_dir, arq.get('filename'))

                # print("Matched: %s" % matched_csv)

            else:
                self.download_file(arq.get('url'), cutout_dir, arq.get('filename'))

        # Associar o arquivo com o objeto no catalogo

        # Recupera os objetos do catalogo e cria um dict onde a chave e o ra+dec
        catalog = dict()
        rows = self.get_catalog_objects(cutout_job.cjb_product_id)
        for row in rows:
            catalog[row.get('_meta_key')] = row

        # Se tiver o arquivo matched fazer a associacao dos objetos pelo csv
        if matched_csv is not None:
            with open(matched_csv) as csvfile:
                spamreader = csv.DictReader(csvfile, delimiter=',')
                for row in spamreader:
                    key = self.get_object_position_key(row.get('RA'), row.get('DEC'))

                    if key in catalog:
                        obj = catalog[key]

                        cutouts = Cutout.objects.filter(cjb_cutout_job=cutout_job, ctt_thumbname=row.get('THUMBNAME'))

                        for cutout in cutouts:
                            cutout.ctt_object_id = obj.get('_meta_id')
                            cutout.ctt_object_ra = obj.get('_meta_ra')
                            cutout.ctt_object_dec = obj.get('_meta_dec')
                            cutout.save()
                    else:
                        # TODO nao consegue associar o arquivo com um objeto do catalogo
                        pass

    def download_file(self, url, cutout_dir, filename):
        # print("------------- download_file -------------")
        # print("URL: %s" % url)
        # print("Filename: %s" % filename)
        file_path = os.path.join(cutout_dir, filename)

        if not os.path.exists(file_path):
            urllib.request.urlretrieve(url, file_path)

        return file_path

    def get_catalog_objects(self, product_id):
        # print("get_catalog_objects(product_id=%s)" % product_id)
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data

        properties = dict()
        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        db_helper = CutoutJobsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database)

        rows = db_helper.query_result(properties)

        raDec = list()
        for row in rows:
            key = self.get_object_position_key(
                row.get(properties.get("pos.eq.ra;meta.main")), row.get(properties.get("pos.eq.dec;meta.main")))

            raDec.append(dict({
                "_meta_id": row.get(properties.get("meta.id;meta.main")),
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main")),
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main")),
                "_meta_key": key
            }))

        # print("Catalog Objects: %s" % len(raDec))

        return raDec

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
        print('-------------- test_api_help --------------')
        token = self.generate_token()

        ra = [10.0, 20.0, 30.0]
        dec = [40.0, 50.0, 60.0]
        xs = [1.0, 2.0, 3.0, 4.0]
        ys = [2.0]

        # create body of request
        body = {
            'token': token,  # required
            'ra': str(ra),  # required
            'dec': str(dec),  # required
            'job_type': 'coadd',  # required 'coadd' or 'single'
            'xsize': str(xs),  # optional (default : 1.0)
            'ysize': str(ys),  # optional (default : 1.0)
            'band': 'g,r,i',  # optional for 'single' epochs jobs (default: all bands)
            'no_blacklist': 'false',
            # optional for 'single' epochs jobs (default: 'false'). return or not blacklisted exposures
            'list_only': 'false',  # optional (default : 'false') 'true': will not generate pngs (faster)
            'email': 'false'  # optional will send email when job is finished
        }

        req = requests.post('http://descut.cosmology.illinois.edu/api/jobs/', data=body)

        # create body for files if needed
        # body_files = {'csvfile': open('mydata.csv', 'rb')}  # To load csv file as part of request
        # To include files
        # req = requests.post('http://descut.cosmology.illinois.edu/api/jobs/', data=body, files=body_files)

        print(req)
        print(req.text)
        print(req.json()['job'])

def sextodec(xyz, delimiter=None):
    """Decimal value from numbers in sexagesimal system.
    The input value can be either a floating point number or a string
    such as "hh mm ss.ss" or "dd mm ss.ss". Delimiters other than " "
    can be specified using the keyword ``delimiter``.
    """
    divisors = [1, 60.0, 3600.0]

    xyzlist = str(xyz).split(delimiter)

    sign = 1

    if "-" in xyzlist[0]:
        sign = -1

    xyzlist = [abs(float(x)) for x in xyzlist]

    decimal_value = 0

    for i, j in zip(xyzlist, divisors):  # if xyzlist has <3 values then
        # divisors gets clipped.
        decimal_value += i / j

    decimal_value = -decimal_value if sign == -1 else decimal_value

    return decimal_value

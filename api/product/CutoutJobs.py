import os

import shutil
from coadd.models import Release, Tag
from common.models import Filter
from lib.CatalogDB import CatalogDB
from product.models import Catalog, Map, Mask, ProductContent, ProductRelease, ProductTag, ProductContentAssociation
from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ProcessRelease
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Q
from django.conf import settings
import requests
from .models import CutOutJob
from .models import CutOut
from common.models import Filter
from product.serializers import AssociationSerializer
from os import mkdir, path


class CutoutJobs:
    db = None

    def __init__(self):
        print("--------- Init ----------")
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

    def generate_token(self):
        """
        Returns a token to create other requests
        Returns: str(token)
        """
        print("Create Authetication Token")
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
        print("Check the expiration time for a token")

        req = requests.get(
            self.host_token + '?token=' + token)

        print(req.json()['message'])

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

        data = req.json()

        if data['status'] != 'error' and data['job_status'] == 'SUCCESS':

            return data['links']

        else:
            # TODO Tratar job com error no lado do servico
            print('Job Com ERROR')


    def parse_result_url(self, url):
        """
        Divide uma url retornada pelo Des Cutout Service em um objeto
        Args:
            url: str()

        Returns:

        """
        # Tipos de arquivos que nao sao imagens
        not_images = ['log', 'csv', 'stifflog']

        arq = dict({
            "filename": None,
            "file_type": None,
            "ra_sex": None,
            "dec_sex": None,
            "ra": None,
            "dec": None,
        })

        # filename = ultima parte da url
        aurl = url.split('/')
        filename = aurl[len(aurl) - 1]
        arq.update({"filename": filename})

        # file_type extensao do arquivo
        file_type = filename.split('.')[len(filename.split('.')) - 1]
        arq.update({"file_type": file_type})


        if file_type not in not_images:
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
                "ra": ra,
                "dec": dec,
            })

        # tipo = a.split('.')[len(a.split('.')) - 1]
        # for row in rows:
        #     originalRa = float(row['_meta_ra'])
        #     originalDec = float(row['_meta_dec'])
        #     ra = float(ra)
        #     dec = float(dec)
        #     if int(originalRa) == int(ra) and round(originalDec, 4) == round(dec, 4):
        #         object_id = row['_meta_id']
        # r = requests.get(url)
        # urlF = "/home/glauber/teste/" + cutname + "/" + a
        # with open(urlF, "wb") as code:
        #     code.write(r.content)

        return arq

    def start_job(self):
        print ("Start Job")

        print(self.host)
        # Pegar todos os CutoutJobs com status = st (Start)
        cutoutjobs = CutOutJob.objects.filter(cjb_status='st')

        print("Jobs: %s" % cutoutjobs.count())

        # Faz um for para cara job
        for job in cutoutjobs:
            print(job.cjb_status)

            product_id = job.cjb_product_id

            token = self.generate_token()

            # muda Status para 2 status (antes de submeter)
            # if job.cjb_status == 'st':
            #     CutOutJob.objects.filter(pk = job.pk).update(cjb_status = 'bs')


            # Recupera o model Catalog pelo product id
            rows = self.get_ra_dec(product_id)

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
            print(req.text)
            if req.json()['status'] == 'ok':
                CutOutJob.objects.filter(pk=job.pk).update(cjb_job_id=req.json()['job'])

                # CutOutJob.objects.filter(pk=job.pk).update(cjb_status='rn')
            else:
                # TODO ACHO QUE AQUI O STATUS DEVERIA SER ERROR
                CutOutJob.objects.filter(pk=job.pk).update(cjb_status='st')

        return ({"status": "ok"})

    def check_job(self):
        """
        Verifica todos os jobs com status running
        """
        print("---------- check_job ----------------")

        # Pegar todos os CutoutJobs com status running
        jobs = CutOutJob.objects.filter(cjb_status='rn')

        print('Count: %s' % jobs.count())

        # Faz um for para cara job
        for job in jobs:
            print("Job: %s" % job.cjb_job_id)

            # Cria um Token
            token = self.generate_token()

            # Consulta o Job no servico
            list_files = self.get_job_results(token, job.cjb_job_id)

            # Download Files
            self.download_cutouts(job, list_files)

                # # Criar o Diretorio para as imagens
                # cutname = job.cjb_display_name.replace(' ', '_') + '_' + str(job.pk)
                #
                # mkdir('/home/glauber/teste/' + cutname)
                #
                # # Pegar a lista com todos os objetos do target
                # rows = self.get_ra_dec(product_id)
                #
                # # Cria uma função que
                # for url in links:
                #     a = url.split('/')
                #     a = a[len(a) - 1]
                #     raDecList = a[+4:].split('.')
                #     raDecList[0] = raDecList[0] + '.' + raDecList[1][-1:]
                #     raDecList[1] = raDecList[1][+1:] + '.' + raDecList[2]
                #     ra = raDecList[0][:+2] + ' ' + raDecList[0][+2:][:+2] + ' ' + raDecList[0][+4:]
                #     dec = raDecList[1][:+3] + ' ' + raDecList[1][+3:][:+2] + ' ' + raDecList[1][+5:].split("_")[0]
                #     object_id = '-'
                #     ra = sextodec(ra) * 15
                #     dec = sextodec(dec)
                #     tipo = a.split('.')[len(a.split('.')) - 1]
                #     for row in rows:
                #         originalRa = float(row['_meta_ra'])
                #         originalDec = float(row['_meta_dec'])
                #         ra = float(ra)
                #         dec = float(dec)
                #         if int(originalRa) == int(ra) and round(originalDec, 4) == round(dec, 4):
                #             object_id = row['_meta_id']
                #     r = requests.get(url)
                #     urlF = "/home/glauber/teste/" + cutname + "/" + a
                #     with open(urlF, "wb") as code:
                #         code.write(r.content)
                #
                #     # TODO HARDCODED FILTER IN g
                #     f = Filter.objects.get(filter__iexact='g')
                #
                #     CutOut(
                #         cjb_cutout_job=job,
                #         ctt_object_id=object_id,
                #         ctt_ra=ra,
                #         ctt_dec=dec,
                #         ctt_filter=f,
                #         ctt_file_path=urlF,
                #         ctt_file_type=tipo
                #     ).save()
                #
                # CutOutJob.objects.filter(pk=job.pk).update(cjb_status='ok')

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

        # TODO esse remove deve ser retirado esta aqui so para teste
        shutil.rmtree(cutout_dir, ignore_errors=True)

        try:
            os.makedirs(cutout_dir)
            return cutout_dir

        except OSError:
            print("Cutout path already exists: %s" % cutout_dir)
            raise

    def download_cutouts(self, cutout_job, list_files):
        print("----------- download_cutouts -------------------")

        cutout_dir = self.get_cutout_dir(cutout_job)

        # Verificar se tem um csv com o nome dos arquivos e as coordenadas

        print('Cutout_Dir: %s' % cutout_dir)
        for url in list_files:
            arq = self.parse_result_url(url)

            print(arq)


    # def download_file(self, cutout_dir, url):
    #
    #     urllib.request.urlretrieve()

    def get_ra_dec(self, product_id):
        print("get_ra_dec(%s)" % product_id)
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data

        properties = dict()
        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        # Conexao com banco de Dados de Catalogos
        if catalog.tbl_database is not None:
            db = CatalogDB(db=catalog.tbl_database)
        else:
            db = CatalogDB()

        # TODO TESTE COM LIMIT
        rows, count = db.wrapper.query(
            schema=catalog.tbl_schema,
            table=catalog.tbl_name,
            columns=[
                properties.get("meta.id;meta.main"),
                properties.get("pos.eq.ra;meta.main"),
                properties.get("pos.eq.dec;meta.main")
            ],
            limit=1
        )

        raDec = list()
        for row in rows:
            raDec.append(dict({
                "_meta_id": row.get(properties.get("meta.id;meta.main")),
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main")),
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            }))

        return raDec


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
            'no_blacklist': 'false', # optional for 'single' epochs jobs (default: 'false'). return or not blacklisted exposures
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

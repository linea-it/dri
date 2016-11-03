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

class CutoutJobs():
    db = None

    def start_job():
        # Pegar todos os CutoutJobs com status inical 
        cutoutjobs = CutOutJob.objects.filter(cjb_status = 'st')
        # Faz um for para cara job
        for i in cutoutjobs:
            print(i.cjb_status)
            product_id = i.cjb_product_id
            # muda Status para 2 status (antes de submeter)
            # if i.cjb_status == 'st':
            #     CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'bs')
            # Recupera o model Catalog pelo product id
            rows = get_ra_dec(product_id)
            ra = list()
            dec = list()
            for row in rows:
                ra.append(float(row['_meta_ra']))
                dec.append(float(row['_meta_dec']))
            
            req = requests.post('http://descut.cosmology.illinois.edu/api/token/',data={'username':settings.USER_CUTOUT, 'password': settings.PASS_CUTOUT})
            token = req.json()['token']
            req = requests.get('http://descut.cosmology.illinois.edu/api/token/?token='+token)
            body = {
              'token': token,
              'ra': str(ra),
              'dec': str(dec),
              'job_type': i.cjb_job_type            
            }
            if i.cjb_xsize:
                body.update({'xsize': i.cjb_xsize})
            if i.cjb_ysize:
                body.update({'ysize': i.cjb_ysize})

            if i.cjb_job_type == 'single':
                if i.cjb_band:
                    body.update({'band': i.cjb_band})            
                if i.cjb_Blacklist:
                    body.update({'no_blacklist': 'true'})
                else:
                    body.update({'no_blacklist': 'false'})
            # Faz o Submit pro serviço do NCSA
            req = requests.post('http://descut.cosmology.illinois.edu/api/jobs/', data=body)
            # muda o status pra enviado e inclui o retorno do submit
            print(req.text)
            if req.json()['status'] == 'ok':
                CutOutJob.objects.filter(pk = i.pk).update(cjb_job_id = req.json()['job'])
                CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'rn')
            else:
                CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'st')
        return({"status": "ok"})

    def check_job():
        # Pegar todos os CutoutJobs com status inical 
        cutoutjobs = CutOutJob.objects.filter(cjb_status = 'rn')
        # Faz um for para cara job
        from os import mkdir
        for i in cutoutjobs:
            print(i.cjb_job_id)
            product_id = i.cjb_product_id
            req = requests.post('http://descut.cosmology.illinois.edu/api/token/',data={'username':settings.USER_CUTOUT, 'password': settings.PASS_CUTOUT})
            token = req.json()['token']
            req = requests.get('http://descut.cosmology.illinois.edu/api/jobs/?token='+token+'&jobid='+i.cjb_job_id)
            # print(req.json())
            if req.json()['status'] != 'error' and req.json()['job_status'] == 'SUCCESS':
                links = req.json()['links']
                cutname = i.cjb_display_name.replace(' ', '_') +'_'+ str(i.pk)
                mkdir('/home/rafael/teste/'+cutname)
                # Pegar a lista com todos os objetos do target 
                rows = get_ra_dec(product_id)
                # Cria uma função que 
                for url in links:
                    a = url.split('/')
                    a = a[len(a) -1]
                    raDecList = a[+4:].split('.')
                    raDecList[0] = raDecList[0] + '.'+raDecList[1][-1:] 
                    raDecList[1] =raDecList[1][+1:] + '.' +raDecList[2]
                    ra = raDecList[0][:+2] + ' ' + raDecList[0][+2:][:+2] + ' ' + raDecList[0][+4:]
                    dec = raDecList[1][:+3] + ' ' + raDecList[1][+3:][:+2] + ' ' + raDecList[1][+5:].split("_")[0]
                    object_id = '-'
                    ra = sextodec(ra)*15 
                    dec = sextodec(dec)
                    tipo = a.split('.')[len(a.split('.')) -1]
                    for row in rows:
                        originalRa = float(row['_meta_ra'])
                        originalDec = float(row['_meta_dec'])
                        ra = float(ra)
                        dec = float(dec)
                        if int(originalRa) == int(ra) and round(originalDec, 4) == round(dec, 4):
                            object_id = row['_meta_id']
                    r = requests.get(url)
                    urlF = "/home/rafael/teste/"+cutname+"/"+a
                    with open(urlF, "wb") as code:
                        code.write(r.content)
                    f = Filter.objects.get(filter__iexact = 'g')
                    CutOut(cjb_cutout_job=i, ctt_url = urlF, ctt_object_id = object_id, ctt_filter = f, ctt_ra = ra, ctt_tipo = tipo, ctt_dec = dec).save()
                CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'ok')
        return({"status": "ok"})

def sextodec(xyz,delimiter=None):
    """Decimal value from numbers in sexagesimal system.
    The input value can be either a floating point number or a string
    such as "hh mm ss.ss" or "dd mm ss.ss". Delimiters other than " "
    can be specified using the keyword ``delimiter``.
    """
    divisors = [1,60.0,3600.0]

    xyzlist = str(xyz).split(delimiter)

    sign = 1

    if "-" in xyzlist[0]:
      sign = -1

    xyzlist = [abs(float(x)) for x in xyzlist]

    decimal_value = 0 

    for i,j in zip(xyzlist,divisors): # if xyzlist has <3 values then
                                    # divisors gets clipped.
        decimal_value += i/j

    decimal_value = -decimal_value if sign == -1 else decimal_value

    return decimal_value

def get_ra_dec(product_id):
    catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
    queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
    serializer = AssociationSerializer(queryset, many=True)
    associations = serializer.data            
    properties = dict()
    for property in associations:
        if property.get('pcc_ucd'):
            properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})
    ra = list()
    dec = list()
    schema = catalog.tbl_schema
    table = catalog.tbl_name
    db = CatalogDB()
    rows, count = db.wrapper.query(table)
    # Cria os array
    auxDict = dict()
    raDec = list()
    for row in rows:
        auxDict.update({
            "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
            })
        auxDict.update({
            "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            })
        auxDict.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main"))
            })
        raDec.append(auxDict)
        auxDict = dict()
    return raDec
    # Funcao para converter ra dec


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
            if i.cjb_status == 'st':
                CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'bs')
            # Recupera o model Catalog pelo product id
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
            for row in rows:
                row.update({
                    "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
                    })
                row.update({
                    "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
                    })
                ra.append(float(row['_meta_ra']))
                dec.append(float(row['_meta_dec']))
            
            req = requests.post('http://descut.cosmology.illinois.edu/api/token/',data={'username':settings.USER_CUTOUT, 'password': settings.PASS_CUTOUT})
            token = req.json()['token']
            req = requests.get('http://descut.cosmology.illinois.edu/api/token/?token='+token)
            body = {
              'token': token,
              'ra': str(ra[:1]),
              'dec': str(dec[:1]),
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
            req = requests.post('http://descut.cosmology.illinois.edu/api/token/',data={'username':settings.USER_CUTOUT, 'password': settings.PASS_CUTOUT})
            token = req.json()['token']
            req = requests.get('http://descut.cosmology.illinois.edu/api/jobs/?token='+token+'&jobid='+i.cjb_job_id)
            print(req.json()['status'])
            if req.json()['status'] != 'error':
                links = req.json()['links']
                cutname = i.cjb_display_name.replace(' ', '_') +'_'+ str(i.pk)
                mkdir('/home/rafael/teste/'+cutname)
                for url in links:
                    a = url.split('/')
                    a = a[len(a) -1]
                    r = requests.get(url)
                    with open("/home/rafael/teste/"+cutname+"/"+a, "wb") as code:
                        code.write(r.content)
                CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'ok')
        return({"status": "ok"})
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

class CutoutJobs():
    db = None

    def start_job(ra, dec, job_type, xs=None, ys=None):

    	# Pegar todos os CutoutJobs com status inical 
    	cutoutjobs = CutOutJob.objects.select_related().all()
    	# Faz um for para cara job
    	for i in cutoutjobs:
    		print(i.cjb_status)
    		# muda Status para 2 status (antes de submeter)
    		if i.cjb_status == 'st':
    			CutOutJob.objects.filter(pk = i.pk).update(cjb_status = 'bs')    	

    	# Recupera o model Catalog pelo product id 

    	# Recupera a lista de objetos usando o banco de catalogos levar em conta associacao

    	# Cria os array

    	# Muda o statis para enviado

    	# Faz o Submit pro serviço do NCSA

    	# muda o status pra enviado e inclui o retorno do submit




    	req = requests.post('http://descut.cosmology.illinois.edu/api/token/',data={'username':settings.USER_CUTOUT, 'password': settings.PASS_CUTOUT})
    	token = req.json()['token']
    	req = requests.get('http://descut.cosmology.illinois.edu/api/token/?token='+token)
    	body = {
    		'token': token,
    		'ra': str(ra),
    		'dec': str(dec),
    		'job_type': job_type    		
    	}
    	if xs:
    		body.update({'xsize': str(xs)})
    	if ys:
    		body.update({'xsize': str(ys)})
    		
    	# req = requests.post('http://descut.cosmology.illinois.edu/api/jobs/', data=body)
    	return (req.text)
from django.db import models

import logging
logger = logging.getLogger(__name__)


# Create your models here.
class Export(models.Model):
 
    exp_username = models.CharField(max_length=128)
    exp_date = models.DateTimeField()
    exp_product_id = models.PositiveIntegerField()
    exp_external_process = models.PositiveIntegerField()

class ExternalProcess(models.Model):
    
    epr_name = models.CharField(max_length=128)
    epr_username = models.CharField(max_length=128)
    epr_start_date = models.DateTimeField()
    epr_end_date = models.DateTimeField()
    epr_readme = models.CharField(max_length=128)
    epr_comment = models.CharField(max_length=128)
    epr_original_id = models.PositiveIntegerField()
    epr_site = models.CharField(max_length=128)

class Site(models.Model):
    
    ste_name = models.CharField(max_length=128)
    ste_url = models.CharField(max_length=128)

class Discover(models.Model):
    dsc_dummy = models.CharField(max_length=128, default=None)

class Upload(models.Model):
    upl_dummy = models.CharField(max_length=128, default=None)


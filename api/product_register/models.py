import logging

from django.db import models
logger = logging.getLogger(__name__)


# Create your models here.
class Export(models.Model):
 
    exp_username = models.CharField(max_length=128)
    exp_date = models.DateTimeField()
    exp_product_id = models.PositiveIntegerField()
    exp_external_process = models.PositiveIntegerField()

class ExternalProcess(models.Model):
    epr_name = models.CharField(max_length=128, verbose_name='Internal Name')
    epr_username = models.CharField(max_length=128, verbose_name='User Name')
    epr_site = models.CharField(max_length=128, verbose_name='Site',
                                help_text='origin of the process. instance from which it was imported.')
    epr_original_id = models.PositiveIntegerField(verbose_name='Original Id',
                                                  help_text='original process id on your instances of origin.')
    epr_start_date = models.DateTimeField(verbose_name='Start Date')
    epr_end_date = models.DateTimeField(verbose_name='End Date')
    epr_readme = models.CharField(max_length=128, verbose_name='Readme')
    epr_comment = models.CharField(max_length=128, verbose_name='Comment', help_text='Process submission comment.')


    def __str__(self):
        return str(self.epr_original_id)

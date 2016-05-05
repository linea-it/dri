import logging

from django.db import models
from django.conf import settings

logger = logging.getLogger(__name__)

class Feature(models.Model):
    ftr_name = models.CharField(
       max_length=60, verbose_name='Internal Name')

    def __str__(self):
        return self.ftr_name

class Flagged(models.Model):
    flg_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE) 
    flg_dataset = models.ForeignKey(
        'coadd.Dataset',
        on_delete=models.CASCADE)
    flg_flagged = models.BooleanField(
        default=False, blank=True, verbose_name='Flagged')

    def __str__(self):
        return self.flg_flagged


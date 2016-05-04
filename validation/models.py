import logging

from django.db import models

logger = logging.getLogger(__name__)

class Features(models.Model):
    ftr_name = models.CharField(
       max_length=60, verbose_name='Internal Name')

    def __str__(self):
        return self.ftr_name

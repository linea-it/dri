from django.db import models

import logging
logger = logging.getLogger(__name__)


# Create your models here.
class ProductClass(models.Model):

    pcl_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    pcl_display_name = models.CharField(
        max_length=128, verbose_name='Display Name')
    pcl_is_system = models.BooleanField(
        default=False, verbose_name='System class type')

    def __str__(self):
        return self.pcl_display_name

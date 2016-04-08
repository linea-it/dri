from django.db import models

import logging
logger = logging.getLogger(__name__)


# Create your models here.
class ProductClass(models.Model):

    pcl_name = models.CharField(
        max_length=128, unique=True, verbose_name='Internal name, unique')
    pcl_display_name = models.CharField(
        max_length=128, verbose_name='User-friendly display name')
    pcl_is_system = models.BooleanField(
        default=False, verbose_name='Is a system class type')

    def __str__(self):
        return self.pcl_display_name

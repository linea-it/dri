import logging

from django.db import models
logger = logging.getLogger(__name__)


# Create your models here.
class ProductClass(models.Model):

    pcl_name = models.CharField(
        max_length=128, unique=True, verbose_name='Internal Name', help_text='Internal name, unique')
    pcl_group = models.ForeignKey(
        'product_classifier.ProductGroup', on_delete=models.CASCADE, verbose_name='Group')
    pcl_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', help_text='User-friendly display name')
    pcl_is_system = models.BooleanField(
        default=False, verbose_name='System', help_text='Is a system class type')

    def __str__(self):
        return self.pcl_display_name

class ProductGroup(models.Model):

    pgr_name = models.CharField(
        max_length=128, unique=True, verbose_name='Internal Name', help_text='Internal name, unique')
    pgr_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', help_text='User-friendly display name')
    is_catalog = models.BooleanField(
        default=False, verbose_name='Is Catalog', help_text='Mark the group as catalog.')

    def __str__(self):
        return self.pgr_display_name

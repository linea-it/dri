from django.db import models
import logging
from product_classifier.models import ProductClass

logger = logging.getLogger(__name__)


# Create your models here.
class Product(models.Model):

    prd_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    prd_display_name = models.CharField(
        max_length=128, verbose_name='Display Name')
    prd_version = models.CharField(
        max_length=128, verbose_name='Version')
    prd_description = models.CharField(
        max_length=1024, verbose_name='Description')
    prd_class = models.ForeignKey(
        ProductClass, on_delete=models.CASCADE, verbose_name='Product class')
    prd_flag_removed = models.BooleanField(
        default=False, verbose_name='Mark a product as removed')

    def __str__(self):
        return self.prd_display_name


class File(Product):

    fli_base_path = models.CharField(
        max_length=256, verbose_name='Base path')
    fli_name = models.CharField(
        max_length=128, verbose_name='Filename with extension')

    def __str__(self):
        return self.fli_name


class Table(Product):

    tbl_schema = models.CharField(
        max_length=128, verbose_name='Schema name')
    tbl_name = models.CharField(
        max_length=128, verbose_name='Tablename without schema')

    def __str__(self):
        return self.tbl_name


class Catalog(Table):

    ctl_num_columns = models.PositiveIntegerField(
        verbose_name='Num of columns')
    ctl_num_tiles = models.PositiveIntegerField(
        verbose_name='Num of tiles')
    ctl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of objects')


class Map(Table):

    mpa_nside = models.PositiveSmallIntegerField(
        verbose_name='Nside')
    mpa_filter = models.CharField(
        max_length=1, verbose_name='Filter')
    mpa_ordering = models.CharField(
        max_length=8, verbose_name='Ordering')
    # tag_id integer NOT NULL,      # [CMP] already exist for product
    # field_id integer,             # [CMP] already exist for product
    # image character varying(256), # [CMP] should be a relation with File?
    #                                       a product table map can have
    #                                       a file with same id of product...


class Mask(Table):

    msk_filter = models.CharField(
        max_length=1, verbose_name='Filter')
    # tag_id integer NOT NULL,      # [CMP] already exist for product
    # field_id integer,             # [CMP] already exist for product

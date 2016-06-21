from product_classifier.models import ProductClass
from product_classifier.models import ProductClassContent
from product_register.models import ExternalProcess

from django.db import models


# Create your models here.
class Product(models.Model):
    prd_process_id = models.ForeignKey(
        ExternalProcess, on_delete=models.CASCADE, verbose_name='External Process')
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
        default=False, verbose_name='Is Removed', help_text='True to mark a product as removed.')

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
        max_length=128, verbose_name='Schema name', null=True, blank=True)
    tbl_name = models.CharField(
        max_length=128, verbose_name='Tablename without schema')

    def __str__(self):
        return self.tbl_name


class Catalog(Table):

    ctl_num_columns = models.PositiveIntegerField(
        verbose_name='Num of columns', null=True, blank=True)
    ctl_num_tiles = models.PositiveIntegerField(
        verbose_name='Num of tiles', null=True, blank=True)
    ctl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of objects', null=True, blank=True)


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


class ProductContent(models.Model):
    pcn_product_id = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    pcn_column_name = models.CharField(
        max_length=256, verbose_name='Column Name')

    def __str__(self):
        return self.pcn_column_name


class ProductContentAssociation(models.Model):
    pca_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product', null=True, blank=True, default=None
    )
    pca_class_content = models.ForeignKey(
        ProductClassContent, on_delete=models.CASCADE, verbose_name='Class Content', null=True, blank=True,
        default=None
    )
    pca_product_content = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Product Content', null=True, blank=True,
        default=None
    )

from coadd.models import Release, Tag
from django.db import models
from product_classifier.models import ProductClass
from product_classifier.models import ProductClassContent
from product_register.models import ExternalProcess


class Product(models.Model):
    prd_process_id = models.ForeignKey(
        ExternalProcess, on_delete=models.CASCADE, verbose_name='External Process')
    prd_class = models.ForeignKey(
        ProductClass, on_delete=models.CASCADE, verbose_name='Product class')
    prd_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    prd_display_name = models.CharField(
        max_length=128, verbose_name='Display Name')
    prd_product_id = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Product Id', help_text='Original Product Id')
    prd_version = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Version')
    prd_description = models.CharField(
        max_length=1024, null=True, blank=True, verbose_name='Description')
    prd_flag_removed = models.BooleanField(
        default=False, verbose_name='Is Removed', help_text='True to mark a product as removed.')
    prd_filter = models.ForeignKey(
        'common.Filter', verbose_name='Filter', null=True, blank=True, default=None)

    releases = models.ManyToManyField(
        Release,
        through='ProductRelease',
        default=None,
        verbose_name='Releases'
    )

    tags = models.ManyToManyField(
        Tag,
        through='ProductTag',
        default=None,
        verbose_name='Tags'
    )

    def __str__(self):
        return self.prd_display_name


class ProductRelease(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE)
    release = models.ForeignKey(
        Release, on_delete=models.CASCADE)


class ProductTag(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE)
    tag = models.ForeignKey(
        Tag, on_delete=models.CASCADE)


class File(Product):
    fli_base_path = models.CharField(
        max_length=256, verbose_name='Base path')
    fli_name = models.CharField(
        max_length=128, verbose_name='Filename with extension')

    def __str__(self):
        return self.fli_name


class Table(Product):
    tbl_database = models.CharField(
        max_length=128, verbose_name='Database', null=True, blank=True, help_text='Database identifier in settings')
    tbl_schema = models.CharField(
        max_length=128, verbose_name='Schema name', null=True, blank=True)
    tbl_name = models.CharField(
        max_length=128, verbose_name='Tablename', help_text='Tablename without schema')

    def __str__(self):
        return self.tbl_name


class Catalog(Table):
    ctl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of objects', null=True, blank=True)

    def __str__(self):
        return self.prd_display_name


class Map(Table):
    mpa_nside = models.PositiveSmallIntegerField(
        verbose_name='Nside')
    mpa_ordering = models.CharField(
        max_length=8, verbose_name='Ordering')


class Mask(Table):
    msk_filter = models.CharField(
        max_length=1, verbose_name='Filter')


class ProductContent(models.Model):
    pcn_product_id = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    pcn_column_name = models.CharField(
        max_length=256, verbose_name='Column Name')

    def __str__(self):
        return self.pcn_column_name


class ProductContentAssociation(models.Model):
    pca_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product', default=None
    )
    pca_class_content = models.ForeignKey(
        ProductClassContent, on_delete=models.CASCADE, verbose_name='Class Content', default=None
    )
    pca_product_content = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Product Content', default=None
    )

import logging

from django.db import models


class ProductGroup(models.Model):
    pgr_name = models.CharField(
        max_length=128, unique=True, verbose_name='Internal Name', help_text='Internal name, unique')
    pgr_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', help_text='User-friendly display name')
    is_catalog = models.BooleanField(
        default=False, verbose_name='Is Catalog', help_text='Mark the group as catalog.')

    def __str__(self):
        return self.pgr_display_name


class ProductClass(models.Model):
    pcl_name = models.CharField(
        max_length=128, unique=True, verbose_name='Internal Name', help_text='Internal name, unique'
    )
    pcl_group = models.ForeignKey(
        ProductGroup, on_delete=models.CASCADE, verbose_name='Group'
    )
    pcl_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', help_text='User-friendly display name'
    )
    pcl_is_system = models.BooleanField(
        default=False, verbose_name='System', help_text='Is a system class type'
    )

    def __str__(self):
        return self.pcl_display_name

class ContentCategory(models.Model):
    cct_name = models.CharField(
        max_length=128, verbose_name='Category Name', null=False, blank=False
    )

    def __str__(self):
        return self.cct_name


class ProductClassContent(models.Model):
    pcc_class = models.ForeignKey(
        ProductClass, on_delete=models.CASCADE, verbose_name='Product Class', null=True, blank=True, default=None
    )
    pcc_category = models.ForeignKey(
        ContentCategory, on_delete=models.CASCADE, verbose_name='Content Category', null=True, blank=True, default=None
    )
    pcc_name = models.CharField(
        max_length=30, verbose_name='Name', help_text='Name of the content.', null=False, blank=False
    )
    pcc_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', help_text='Display Name of the content.', null=True, blank=True
    )
    pcc_ucd = models.CharField(
        max_length=128, verbose_name='UCD', help_text='The standard unified content descriptor.', null=True, blank=True
    )
    pcc_unit = models.CharField(
        max_length=128, verbose_name='Unit', help_text='Content Unit e.g. name=ra unit=deg.', null=True, blank=True
    )
    pcc_reference = models.CharField(
        max_length=128, verbose_name='Reference', help_text='Column Reference e.g. name=ra unit=dec reference=J2000.',
        null=True, blank=True
    )
    pcc_mandatory = models.BooleanField(
        default=False, verbose_name='Mandatory', help_text='Mark as true to indicate that this content is mandatory.'
    )

    def __str__(self):
        return self.pcc_name


from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class Query(models.Model):
    # the same user can't have repeated names.
    name = models.CharField(
        max_length=128, unique=False, null=False, verbose_name='Name')
    description = models.CharField(
        max_length=256, null=True, blank=True, verbose_name='Description')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    release = models.ForeignKey('coadd.Release', on_delete=models.CASCADE, null=True, blank=True)
    creation_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Creation Date',
        help_text='Creation Date')
    last_edition_date = models.DateTimeField(
        auto_now=True, null=True, blank=True, verbose_name='Last Edition Date',
        help_text='Last Edition Date')
    sql_sentence = models.TextField(
        max_length=2048, null=False, verbose_name='Sql Sentence')
    is_sample = models.BooleanField(
        default=False, verbose_name='Is a sample query')
    is_public = models.BooleanField(
        default=False, verbose_name='Is Public',
        help_text='Is Public default True')

    def __str__(self):
        return self.name


class Job(models.Model):
    job_status_ops = (
        ('st', 'Starting'),
        ('rn', 'Running'),
        ('ok', 'Done'),
        ('er', 'Error'),
    )
    display_name = models.CharField(
        max_length=128, null=False, verbose_name='Name')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    start_date_time = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Creation Date',
        help_text='Creation Date')
    # review
    end_date_time = models.DateTimeField(
        null=True, blank=True, verbose_name='Last Edition Date',
        help_text='Last Edition Date')
    sql_sentence = models.TextField(
        max_length=2048, null=False, verbose_name='Sql_sentence')
    timeout = models.IntegerField(null=True, default=5,
                                  verbose_name='Query execution timeout in seconds')
    # review limit, size
    job_status = models.CharField(
        max_length=25,
        choices=job_status_ops,
        default='st',
        verbose_name='Status'
    )
    query_name = models.CharField(
        max_length=128, default="Unnamed", verbose_name='Original query name')
    job_id = models.TextField(verbose_name='Job Cerely ID')

class Table(models.Model):
    table_name = models.CharField(
        max_length=128, null=False, unique=True, verbose_name='Name')
    display_name = models.CharField(
        max_length=128, null=False, unique=False, verbose_name='Display name')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    schema = models.CharField(
        max_length=128, null=True, verbose_name='Schema')
    product = models.ForeignKey(
        'product.Product', verbose_name='Product', on_delete=models.CASCADE, related_name='product', null=True,
        blank=True, default=None)
    release = models.ForeignKey('coadd.Release', on_delete=models.CASCADE, null=True, blank=True)

    tbl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of rows', null=True, blank=True)

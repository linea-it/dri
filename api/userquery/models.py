from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class Query(models.Model):
    name = models.CharField(
        max_length=128, null=False, verbose_name='Name')
    description = models.CharField(
        max_length=256, null=False, verbose_name='Description')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    release = models.ForeignKey('coadd.Release')
    creation_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Creation Date',
        help_text='Creation Date')
    last_edition_date = models.DateTimeField(
        auto_now=True, null=True, blank=True, verbose_name='Last Edition Date',
        help_text='Last Edition Date')
    sql_sentence = models.CharField(
        max_length=2048, null=False, verbose_name='Sql Sentence')
    is_sample = models.BooleanField(
        default=False, verbose_name='Is a sample query')
    is_public = models.BooleanField(
        default=False, verbose_name='Is Public',
        help_text='Is Public default True')
    # TODO: missing release and database - Use foreign key;

    def __str__(self):
        return self.name


class Job(models.Model):
    job_status_ops = (
        ('st', 'Starting'),
        ('rn', 'Running'),
        ('ok', 'Done'),
        ('er', 'Error'),
    )
    table_name = models.CharField(
        max_length=128, null=False, unique=False, verbose_name='Name')
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
    sql_sentence = models.CharField(
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

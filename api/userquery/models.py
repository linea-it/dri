from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class Query(models.Model):
    name = models.CharField(
        max_length=128, verbose_name='Name')
    description = models.CharField(
        max_length=256, null=True, verbose_name='Description')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    creation_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Creation Date',
        help_text='Creation Date')
    last_edition_date = models.DateTimeField(
        auto_now=True, null=True, blank=True, verbose_name='Last Edition Date',
        help_text='Last Edition Date')
    table_name = models.CharField(
        max_length=128, null=False, verbose_name='Table Name')
    query = models.CharField(
        max_length=2048, null=False, verbose_name='Query')
    is_validate = models.BooleanField(
        default=False, verbose_name='Is Query Validated')
    is_public = models.BooleanField(
        default=False, verbose_name='Is Public',
        help_text='Is Public default True')
    # TODO: missing release and database - Use foreign key;

    def __str__(self):
        return self.name

from __future__ import unicode_literals

from django.db import models
from django.conf import settings


class Query(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    name = models.CharField(
        max_length=128, verbose_name='Name')
    description = models.CharField(
        max_length=1024, null=True, blank=True, verbose_name='Description')
    query = models.CharField(
        max_length=1024, null=False, blank=True, verbose_name='Query')
    creationdate = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date',
        help_text='Creation Date')
    tablename = models.CharField(
        max_length=128, null=False, blank=True, verbose_name='Table Name')
    is_public = models.BooleanField(
        default=False, verbose_name='Is Public',
        help_text='Is Public default True')

    def __str__(self):
        return self.name

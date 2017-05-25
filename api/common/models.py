# Create your models here.
from django.db import models


class Filter(models.Model):
    project = models.CharField(
        max_length=20, null=True, blank=True, verbose_name='Project')
    filter = models.CharField(
        max_length=3, null=False, blank=False, verbose_name='Filter')
    lambda_min = models.FloatField(
        null=True, blank=True, verbose_name='lambda_min')
    lambda_max = models.FloatField(
        null=True, blank=True, verbose_name='lambda_max')
    lambda_mean = models.FloatField(
        null=True, blank=True, verbose_name='lambda_mean')

    def __str__(self):
        return str(self.filter)

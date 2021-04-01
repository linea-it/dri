import logging

from django.db import models
from django.conf import settings
from current_user import get_current_user
from common.models import Filter

logger = logging.getLogger(__name__)


class Feature(models.Model):
    ftr_name = models.CharField(
        max_length=60, verbose_name='Internal Name')

    def __str__(self):
        return self.ftr_name


class Flagged(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True,)
    flg_dataset = models.ForeignKey(
        'coadd.Dataset',
        on_delete=models.CASCADE,
        related_name='flagged')
    flg_flagged = models.BooleanField(
        default=None, blank=True, verbose_name='Flagged', null=True)

    def __str__(self):
        return str(self.flg_flagged)


class Inspect(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True,)
    isp_dataset = models.OneToOneField(
        'coadd.Dataset',
        on_delete=models.CASCADE,
        related_name='inspected')
    isp_value = models.BooleanField(
        verbose_name='Inspected',
        default=None, blank=True,
        null=True,
        help_text="null for not inspected, True for good and False for bad.")

    def __str__(self):
        return str(self.isp_value)


class Defect(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True,
        verbose_name='Owner')
    dfc_dataset = models.ForeignKey(
        'coadd.Dataset',
        on_delete=models.CASCADE,
        verbose_name='Dataset')
    dfc_filter = models.ForeignKey(
        'common.Filter',
        on_delete=models.CASCADE,
        verbose_name='Filter')
    dfc_feature = models.ForeignKey(
        'validation.Feature',
        on_delete=models.CASCADE,
        verbose_name='Feature')
    dfc_ra = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RA')
    dfc_dec = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Dec')

from django.db import models
from django.conf import settings
from current_user import get_current_user
from coadd.models import Dataset
from common.models import Filter


class Position(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='Owner')
    pst_dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE, verbose_name='Dataset', default=None, null=True, blank=True)
    pst_ra = models.FloatField(
        verbose_name='RA (deg)')
    pst_dec = models.FloatField(
        verbose_name='Dec (deg)')
    pst_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Date')
    pst_comment = models.TextField(
        max_length=2048, verbose_name='Comment')

    def __str__(self):
        return str(self.pk)

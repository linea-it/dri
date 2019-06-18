from django.db import models
from django.conf import settings
from current_user import get_current_user
from coadd.models import Dataset as CoaddDataset
from common.models import Filter


class Position(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='Owner',
        on_delete=models.SET_NULL,
        null=True, blank=True, )
    pst_dataset = models.ForeignKey(
        CoaddDataset,
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

class Dataset(models.Model):
    """
    Comentario por Dataset.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True,)
    dts_dataset = models.ForeignKey(
        CoaddDataset,
        on_delete=models.CASCADE, 
        verbose_name='Dataset', 
        related_name='comments')       
    dts_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Date')
    dts_comment = models.TextField(
        max_length=2048, verbose_name='Comment')

    def __str__(self):
        return str(self.pk)

from django.db import models

# Create your models here.
class Release(models.Model):

    rls_name = models.CharField(max_length=60, verbose_name='Name' )
    rls_version = models.CharField(max_length=60, null=True, blank=True, verbose_name='Version')
    rls_date = models.DateField(null=True, blank=True, verbose_name='Date')
    rls_description = models.TextField(null=True, blank=True, verbose_name='Description')
    rls_doc_url = models.URLField(null=True, blank=True, verbose_name='Doc Url')
    rls_display_name = models.CharField(max_length=60, null=True, blank=True, verbose_name='Display Name')

    def __unicode__(self):
        return self.rls_display_name

class Tile(models.Model):

    tli_tilename = models.CharField(max_length=20, unique=True , verbose_name='Tilename')
    tli_project = models.CharField(max_length=80, null=True, blank=True, verbose_name='Project')
    tli_ra = models.FloatField(null=True, blank=True, verbose_name='RA')
    tli_dec = models.FloatField(null=True, blank=True, verbose_name='Dec')
    tli_equinox = models.FloatField(null=True, blank=True, verbose_name='equinox')
    tli_pixelsize = models.FloatField(null=True, blank=True, verbose_name='pixelsize')
    tli_npix_ra = models.SmallIntegerField(null=True, blank=True, verbose_name='npix_ra')
    tli_npix_dec = models.SmallIntegerField(null=True, blank=True, verbose_name='npix_dec')
    tli_rall = models.FloatField(null=True, blank=True, verbose_name='rall')
    tli_decll = models.FloatField(null=True, blank=True, verbose_name='decll')
    tli_raul = models.FloatField(null=True, blank=True, verbose_name='raul')
    tli_decul = models.FloatField(null=True, blank=True, verbose_name='decul')
    tli_raur = models.FloatField(null=True, blank=True, verbose_name='raur')
    tli_decur = models.FloatField(null=True, blank=True, verbose_name='decur')
    tli_ralr = models.FloatField(null=True, blank=True, verbose_name='ralr')
    tli_declr = models.FloatField(null=True, blank=True, verbose_name='declr')
    tli_urall = models.FloatField(null=True, blank=True, verbose_name='urall')
    tli_udecll = models.FloatField(null=True, blank=True, verbose_name='udecll')
    tli_uraur = models.FloatField(null=True, blank=True, verbose_name='uraur')
    tli_udecur = models.FloatField(null=True, blank=True, verbose_name='udecur')

    def __unicode__(self):
        return self.tli_tilename

from django.db import models

# Create your models here.
class Release(models.Model):

    rls_name = models.CharField(max_length=60, verbose_name='Internal Name' )
    rls_display_name = models.CharField(max_length=60, null=True, blank=True, verbose_name='Display Name')
    rls_version = models.CharField(max_length=60, null=True, blank=True, verbose_name='Version')
    rls_date = models.DateField(null=True, blank=True, verbose_name='Date')
    rls_description = models.TextField(null=True, blank=True, verbose_name='Description')
    rls_doc_url = models.URLField(null=True, blank=True, verbose_name='Doc Url')

    def __str__(self):
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
    tli_rall = models.FloatField(null=True, blank=True, verbose_name='RAll')
    tli_decll = models.FloatField(null=True, blank=True, verbose_name='Decll')
    tli_raul = models.FloatField(null=True, blank=True, verbose_name='RAul')
    tli_decul = models.FloatField(null=True, blank=True, verbose_name='Decul')
    tli_raur = models.FloatField(null=True, blank=True, verbose_name='RAur')
    tli_decur = models.FloatField(null=True, blank=True, verbose_name='Decur')
    tli_ralr = models.FloatField(null=True, blank=True, verbose_name='RAlr')
    tli_declr = models.FloatField(null=True, blank=True, verbose_name='Declr')
    tli_urall = models.FloatField(null=True, blank=True, verbose_name='urall')
    tli_udecll = models.FloatField(null=True, blank=True, verbose_name='udecll')
    tli_uraur = models.FloatField(null=True, blank=True, verbose_name='uraur')
    tli_udecur = models.FloatField(null=True, blank=True, verbose_name='udecur')

    def __str__(self):
        return self.tli_tilename

class Tag(models.Model):

    tag_release = models.ForeignKey(Release, related_name='tags', on_delete=models.CASCADE, verbose_name='Release')
    tag_name = models.CharField(max_length=60, verbose_name='Internal Name')
    tag_display_name = models.CharField(max_length=80, null=True, blank=True, verbose_name='Display Name')
    tag_install_date = models.DateField(null=True, blank=True, verbose_name='Install Date')
    tag_release_date = models.DateField(null=True, blank=True, verbose_name='Release Date')
    tag_status = models.BooleanField(default=False, blank=True, verbose_name='Status')
    tag_start_date = models.DateField(null=True, blank=True, verbose_name='Start Date')
    tag_discovery_date = models.DateField(null=True, blank=True, verbose_name='Discovery Date')

    tiles = models.ManyToManyField(
        Tile,
        through='Tag_Tile',
    )

    def __str__(self):
        return self.tag_display_name

class Tag_Tile(models.Model):

    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    tile = models.ForeignKey(Tile, on_delete=models.CASCADE)
    run = models.CharField(null=True, blank=True, max_length=30, verbose_name='Run')

    def __str__(self):
        return self.pk
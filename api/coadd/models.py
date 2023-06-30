import logging

from django.contrib.auth.models import Group, User
from django.db import models
from django.db.models import Q

logger = logging.getLogger(__name__)


class Release(models.Model):

    rls_name = models.CharField(
        max_length=60, verbose_name='Internal Name')
    rls_display_name = models.CharField(
        max_length=60, null=True, blank=True, verbose_name='Display Name')
    rls_version = models.CharField(
        max_length=60, null=True, blank=True, verbose_name='Version')
    rls_date = models.DateField(
        null=True, blank=True, verbose_name='Date')
    rls_description = models.TextField(
        null=True, blank=True, verbose_name='Description')
    rls_doc_url = models.URLField(
        null=True, blank=True, verbose_name='Doc Url')
    rls_default = models.BooleanField(
        default=False, verbose_name='Default',
        help_text='Mark this release as Default so that the interfaces can select this release previously.')
    rls_disabled = models.BooleanField(
        default=False, verbose_name='Disabled',
        help_text='Mark this release as Disabled so that the interfaces cant select this release.')

    rls_is_public = models.BooleanField(
        default=False, verbose_name='Is Public',
        help_text='Mark the release as public so that it is available to all users. uncheck it to make it available only to groups that have permission.')

    def __str__(self):
        return self.rls_display_name


class ReleaseGroupPermission(models.Model):
    rgp_release = models.ForeignKey(
        Release,
        related_name='release_group_permission',
        on_delete=models.CASCADE,
        verbose_name='Release'
    )

    rgp_user_group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        verbose_name='User Group'
    )


class Tile(models.Model):
    tli_tilename = models.CharField(
        db_index=True, max_length=20, unique=True, verbose_name='Tilename')
    tli_project = models.CharField(
        max_length=80, null=True, blank=True, verbose_name='Project')
    tli_ra = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RA')
    tli_dec = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Dec')
    tli_equinox = models.FloatField(
        null=True, blank=True, default=0, verbose_name='equinox')
    tli_pixelsize = models.FloatField(
        null=True, blank=True, default=0, verbose_name='pixelsize')
    tli_npix_ra = models.SmallIntegerField(
        null=True, blank=True, default=0, verbose_name='npix_ra')
    tli_npix_dec = models.SmallIntegerField(
        null=True, blank=True, default=0, verbose_name='npix_dec')
    tli_rall = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RAll')
    tli_decll = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Decll')
    tli_raul = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RAul')
    tli_decul = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Decul')
    tli_raur = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RAur')
    tli_decur = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Decur')
    tli_ralr = models.FloatField(
        null=True, blank=True, default=0, verbose_name='RAlr')
    tli_declr = models.FloatField(
        null=True, blank=True, default=0, verbose_name='Declr')
    tli_urall = models.FloatField(
        null=True, blank=True, default=0, verbose_name='urall')
    tli_udecll = models.FloatField(
        null=True, blank=True, default=0, verbose_name='udecll')
    tli_uraur = models.FloatField(
        null=True, blank=True, default=0, verbose_name='uraur')
    tli_udecur = models.FloatField(
        null=True, blank=True, default=0, verbose_name='udecur')
    tli_urall_180 = models.FloatField(
        null=True, blank=True, default=0, verbose_name='urall 180', help_text='urall in -180 a 180 degrees')
    tli_uraur_180 = models.FloatField(
        null=True, blank=True, default=0, verbose_name='uraur 180', help_text='uraur in -180 a 180 degrees')

    def __str__(self):
        return self.tli_tilename


class Tag(models.Model):
    tag_release = models.ForeignKey(
        Release, related_name='tags', on_delete=models.CASCADE, verbose_name='Release')
    tag_name = models.CharField(
        max_length=60, verbose_name='Internal Name')
    tag_display_name = models.CharField(
        max_length=80, null=True, blank=True, verbose_name='Display Name')
    tag_install_date = models.DateField(
        null=True, blank=True, verbose_name='Install Date')
    tag_release_date = models.DateField(
        null=True, blank=True, verbose_name='Release Date')
    tag_status = models.BooleanField(
        default=False, blank=True, verbose_name='Status')
    tag_start_date = models.DateField(
        null=True, blank=True, verbose_name='Start Date')
    tag_discovery_date = models.DateField(
        null=True, blank=True, verbose_name='Discovery Date')

    tiles = models.ManyToManyField(
        Tile,
        through='Dataset',
    )

    def __str__(self):
        return self.tag_display_name


class Dataset(models.Model):
    tag = models.ForeignKey(
        Tag, on_delete=models.CASCADE, db_index=True)
    tile = models.ForeignKey(
        Tile, on_delete=models.CASCADE, db_index=True)
    run = models.CharField(
        null=True, blank=True, max_length=30, verbose_name='Run')

    date = models.DateField(
        null=True, blank=True, verbose_name='Created Date')

    archive_path = models.TextField(
        null=True, 
        blank=True, 
        verbose_name='Archive Path', 
        help_text='Base file path without root folder.')

    ncsa_original_path = models.TextField(
        null=True, 
        blank=True, 
        default=None,
        verbose_name='NCSA Original Path', 
        help_text='NCSA Original file path'
    )

    image_src_thumbnails = models.URLField(
        null=True, blank=True, verbose_name='Thumbnails PNG', default=None,
        help_text=('Full URL to image including the host and directory. '
                   'Example: http://{host}/data/releases/{release_name}/images/thumb')
    )

    image_src_ptif = models.URLField(
        null=True, blank=True, verbose_name='Visiomatic PTIF', default=None,
        help_text=('Full URL for visiomatic ptif image, including the host and directory. '
                   'Use the release name and tilename to create the path. '
                   'Example: http://{host}/visiomatic?FIF=data/releases/{archive_path}/<image_path>/{tilename}.ptif')
    )

    ncsa_src_ptif = models.URLField(
        null=True, blank=True, verbose_name='Thumbnails PNG', default=None,
        help_text=('Full URL to image in NCSA. '
                   'Example: http://{host}/visiomatic?FIF=data/releases/{archive_path}/<image_path>/{tilename}.ptif')
    )

    def __str__(self):
        return str(self.pk)


class Survey(models.Model):
    srv_release = models.ForeignKey(
        Release, related_name='surveys', on_delete=models.CASCADE, verbose_name='Release')
    srv_filter = models.ForeignKey(
        'common.Filter', verbose_name='Filter', on_delete=models.CASCADE, default=None, null=True, blank=True)
    srv_project = models.CharField(
        max_length=20, null=True, blank=True, verbose_name='Project')
    srv_display_name = models.CharField(
        max_length=80, verbose_name='Display Name')
    srv_url = models.URLField(
        verbose_name='URL',
        help_text=('Full URL to the aladin images path, including the host and directory. '
                   'Example: http://{host}/data/releases/{release_name}/images/aladin/{band}')
    )
    srv_target = models.CharField(
        max_length=25, null=True, blank=True, verbose_name='Target',
        help_text=(
            'Initial position for this survey must be hours or degrees. '
            'Example: 02 21 36.957 -05 31 10.26 or 35.4832, -5.4800.')
    )
    srv_fov = models.FloatField(
        max_length=10, null=True, blank=True, verbose_name='FoV',
        help_text='Initial Zoom in degrees.'
    )

    def __str__(self):
        return str(self.srv_display_name)


def get_user_releases(self):
    """Esta função é adicionada ao model User,
    ela retorna os ids de todos os releases que o usuario tem permisão de acessar. 

    1 - Se o usuario é um staff do admin, retorna todos os releases HABILITADOS (rls_disabled=False)

    2 - Para os demais usuarios, retorna todos os releases publicos (rls_is_public=True) e OU filtra pelos grupos dos usuarios, 
    esses grupos devem estar associados aos releases no model ReleaseGroupPermission. 

    Returns:
        [list]: Lista de ids dos releases que o usuario pode ter acesso. 
    """

    releases = list()
    # Se for um usuario Admin do django retorna todos os releases Habilitados.
    if self.is_staff:
        releases = Release.objects.filter(rls_disabled=False)
    else:
        # IDs dos grupos que o usuario faz parte
        a_groups = []
        for group in self.groups.all():
            a_groups.append(group.pk)

        # Todos os Releases Publicos + os Releases relacionados aos grupos que o usuario pertence.
        releases = Release.objects.filter(
            Q(rls_disabled=False) & Q(
                Q(rls_is_public=True) | Q(release_group_permission__rgp_user_group__in=a_groups))
        )

    ids = list()
    for release in releases:
        ids.append(release.pk)

    return ids


User.add_to_class('get_user_releases', get_user_releases)

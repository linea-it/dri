import copy
import os
from urllib.parse import urljoin

import django_filters
from common.models import Filter
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend, OrderingFilter
from lib.sqlalchemy_wrapper import DBBase
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Dataset, Release, Survey, Tag, Tile
from .serializers import (DatasetFootprintSerializer, DatasetSerializer,
                          ReleaseSerializer, SurveySerializer, TagSerializer,
                          TileSerializer)

from common.desaccess import DesAccessApi
from django.db.models import Q


class ReleaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    # queryset = Release.objects.filter(rls_disabled=False)

    serializer_class = ReleaseSerializer

    search_fields = ('rls_name', 'rls_display_name',)

    filter_fields = ('id', 'rls_name', 'rls_display_name',)

    ordering_fields = '__all__'

    def get_queryset(self):

        # Se o usuario for admin do Django retorna todos os releases Habilitados
        if self.request.user.is_staff:
            return Release.objects.filter(rls_disabled=False)
        else:
            # Retorna os IDs de todos os releases que o usuario tem permissão de acessar.
            perm_releases = self.request.user.get_user_releases()

            # Todos os Releases Publicos + os Releases relacionados aos grupos que o usuario pertence.
            queryset = Release.objects.filter(pk__in=perm_releases)

            return queryset


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited
    """

    queryset = Tag.objects.all()

    serializer_class = TagSerializer

    filter_fields = ('id', 'tag_release', 'tag_name', 'tag_display_name', 'tag_status',)

    ordering_fields = '__all__'


class TileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tile to be viewed or edited
    """

    queryset = Tile.objects.all()

    serializer_class = TileSerializer

    filter_fields = ('id', 'tli_tilename', 'tag', 'tli_project', 'tli_ra', 'tli_dec',)

    search_fields = ('tli_tilename',)

    ordering_fields = ('tli_tilename', 'tli_ra', 'tli_dec',)

    @action(detail=True)
    def desaccess_tile_info(self, request, pk=None):
        """Search DESaccess for tilename and return a list of tile files.

        Returns:
            dict: returns a dict with the image and catalog urls.
        """
        tile = self.get_object()

        tilename = tile.tli_tilename

        desapi = DesAccessApi()
        tileinfo = desapi.tile_by_name(tilename)

        return Response(tileinfo)

    @action(detail=False, methods=['post'])
    def desaccess_get_download_url(self, request):
        """creates an authenticated url for a file served by DESaccess.

        Args:
            file_url (str): URL of the file to be downloaded.

        Returns:
            str: Authenticated URL, note that this url has a time limit to be used. must be generated at the time the download is requested.
        """

        params = request.data
        file_url = params['file_url']

        desapi = DesAccessApi()

        download_url = desapi.file_url_to_download(file_url)

        return Response(dict({"download_url": download_url}))


class DatasetFilter(django_filters.FilterSet):
    tag__in = django_filters.CharFilter(method='filter_tag__in')
    tli_tilename = django_filters.CharFilter(field_name='tile__tli_tilename', label='Tilename')
    position = django_filters.CharFilter(method='filter_position')
    release = django_filters.CharFilter(method='filter_release')
    inspected = django_filters.CharFilter(method='filter_inspected')

    class Meta:
        model = Dataset
        fields = ['id', 'tag', 'tile', 'tag__in', 'tli_tilename', 'release', ]
        order_by = True

    def filter_release(self, queryset, name, value):
        return queryset.filter(tag__tag_release__id=int(value))

    def filter_tag__in(self, queryset, name, value):
        return queryset.filter(tag__in=value.split(','))

    def filter_position(self, queryset, name, value):
        radec = value.split(',')

        if len(radec) != 2:
            raise Exception(
                'Invalid format to coordinate. the two values must be separated by \',\'.'
                'example 317.8463,1.4111 or 317.8463,-1.4111')

        ra = float(radec[0].strip())
        dec = float(radec[1].strip())

        # Normalizar o ra para -180 e 180 usar as colunas auxiliares urall_180 e uraur_180 para evitar problema
        # com objetos de ra entre 0 e 1
        if ra > 180:
            ra = (ra - 360)

        q = queryset.filter(
            tile__tli_urall_180__lt=ra,
            tile__tli_udecll__lt=dec,
            tile__tli_uraur_180__gt=ra,
            tile__tli_udecur__gt=dec
        )

        return q

    def filter_inspected(self, queryset, name, value):
        """
            Filtra os datasets se eles foram inspecionados ou nao. relacionando com o model validation.Inspect
            os valores possiveis sao:
            True - Inspecionado e avaliado como Bom
            False - Inspecionado e avaliado como Ruin
            None -  Nao Inspecionado.

            o value da requisicao sempre sera string. esse valor
        """
        valid = {
            'true': True, 'True': True, 't': True, '1': True,
            'false': False, 'False': False, 'f': False, '0': False,
            'null': None, 'None': None, 'none': None,
        }
        if value in valid:
            return queryset.filter(inspected__isp_value=valid[value])


class DatasetViewSet(viewsets.ModelViewSet):
    # queryset = Dataset.objects.select_related().all().prefetch_related('comments').prefetch_related('inspected')

    serializer_class = DatasetSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter)

    filter_class = DatasetFilter

    search_fields = ('tile__tli_tilename',)

    ordering_fields = ('tile__tli_tilename', 'date')

    ordering = ('tile__tli_tilename',)

    def get_queryset(self):

        # Recuperar os releases que o usuario tem acesso
        releases = self.request.user.get_user_releases()

        # Filtra a tabela de datasets pelo id dos releases que o usuario tem acesso.
        queryset = Dataset.objects.select_related().all().prefetch_related('comments').prefetch_related('inspected').filter(tag__tag_release__pk__in=releases)

        return queryset

    @action(detail=True)
    def desaccess_tile_info(self, request, pk=None):
        """Search DESaccess for tilename and return a list of tile files already filtered by the dataset release.

        Returns:
            dict: returns a dict with the image and catalog urls, both organized by band and with the file url.
        """
        dataset = self.get_object()

        # Requested to associate these internal releases
        # to the DESAccess releases:
        associated_releases = {
            'y6a2_coadd': 'y6a1_coadd',
            'y3a1_coadd': 'y3a2_coadd',
            'y1_supplemental_dfull': 'y1a1_coadd',
            'y1_supplemental_d10': 'y1a1_coadd',
            'y1_supplemental_d04': 'y1a1_coadd',
            'y1_wide_survey': 'y1a1_coadd',
        }

        tilename = dataset.tile.tli_tilename
        rls_name = dataset.tag.tag_release.rls_name

        # Associate the internal release to the release of DESAccess:
        if rls_name in associated_releases.keys():
            rls_name = associated_releases[rls_name]

        desapi = DesAccessApi()

        tileinfo = desapi.tile_by_name(tilename)

        result = {}

        for release in tileinfo["releases"]:
            # Compara o release pelo internal name, nas nossas tabelas o release tem _coadd no nome. por isso é necessário fazer um split.
            if release["release"] == rls_name.split("_")[0].lower():

                rows = tileinfo["releases"][0]

                for key in rows:
                    if key != 'release' and key != 'num_objects' and key != 'bands':
                        result[key] = rows[key]
                        result['images'] = {}
                        result['catalogs'] = {}

                for band in release["bands"]:

                    result["images"][band] = release["bands"][band]["image"]
                    result["catalogs"][band] = release["bands"][band]["catalog"]

                return Response(result)

    @action(detail=False, methods=['get'])
    def desaccess_tile_info_by_id(self, request):
        """Search DESaccess for tilename and return a list of tile files already filtered by the dataset release.

        Args:
            id (str): URL of the file to be downloaded.

        Returns:
            list: returns a list with the filename and the url of the tile.
        """

        datasetId = request.query_params.get('id')

        if datasetId is None:
            raise Exception('ID paramater is required')

        results = []

        dataset = Dataset.objects.get(id=datasetId)

        # Requested to associate these internal releases
        # to the DESAccess releases:
        associated_releases = {
            'y3a1_coadd': 'y3a2_coadd',
            'y1_supplemental_dfull': 'y1a1_coadd',
            'y1_supplemental_d10': 'y1a1_coadd',
            'y1_supplemental_d04': 'y1a1_coadd',
            'y1_wide_survey': 'y1a1_coadd',
        }

        associated_other_files = {
            'detection': 'Detection Image',
            'main': 'Main Catalog',
            'magnitude': 'Magnitude Catalog',
            'flux': 'Flux Catalog',
            'tiff_image': 'Color Image (TIFF)'
        }

        tilename = dataset.tile.tli_tilename
        rls_name = dataset.tag.tag_release.rls_name

        # Associate the internal release to the release of DESAccess:
        if rls_name in associated_releases.keys():
            rls_name = associated_releases[rls_name]

        desapi = DesAccessApi()

        tileinfo = desapi.tile_by_name(tilename)

        for release in tileinfo["releases"]:
            # Compara o release pelo internal name, nas nossas tabelas o release tem _coadd no nome. por isso é necessário fazer um split.
            if release["release"] == rls_name.split("_")[0].lower():

                for band in release["bands"]:
                    if release["bands"][band]["image"]:
                        results.append({
                            'filename': '%s-Band Image' % band,
                            'url': release["bands"][band]["image"]
                        })

                for band in release["bands"]:
                    if release["bands"][band]["image_nobkg"]:
                        results.append({
                            'filename': '%s-Band Image (no background subtraction)' % band,
                            'url': release["bands"][band]["image_nobkg"]
                        })

                for band in release["bands"]:
                    if release["bands"][band]["catalog"]:
                        results.append({
                            'filename': '%s-Band Catalog' % band,
                            'url': release["bands"][band]["catalog"]
                        })

                for key in release:
                    if key != 'release' and key != 'num_objects' and key != 'bands' and release[key] and release[key] != '' and associated_other_files[key]:
                        results.append({
                            'filename': associated_other_files[key],
                            'url': release[key]
                        })

        return Response(dict({
            'results': results,
            'count': len(results),
        }))

    @action(detail=False, methods=['post'])
    def desaccess_get_download_url(self, request):
        """creates an authenticated url for a file served by DESaccess.

        Args:
            file_url (str): URL of the file to be downloaded.

        Returns:
            str: Authenticated URL, note that this url has a time limit to be used. must be generated at the time the download is requested.
        """

        params = request.data
        file_url = params['file_url']

        desapi = DesAccessApi()

        download_url = desapi.file_url_to_download(file_url)

        return Response(dict({"download_url": download_url}))


class DatasetFootprintViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.select_related().all()

    serializer_class = DatasetFootprintSerializer

    filter_backends = (DjangoFilterBackend,)

    filter_class = DatasetFilter

    ordering_fields = ('id', 'tag')


class SurveyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows surveys to be viewed or edited
    """

    queryset = Survey.objects.select_related().all()

    serializer_class = SurveySerializer

    filter_fields = ('id', 'srv_release', 'srv_project',)

    ordering_fields = ('srv_filter__lambda_min',)


@ api_view(['GET'])
def get_fits_by_tilename(request):
    if request.method == 'GET':

        tag = request.query_params.get('tag', None).lower()
        tilename = request.query_params.get('tilename', None).upper()

        # http://desportal2.cosmology.illinois.edu/data/releases/y3a2_coadd/tiles/DES0334-2332/DES0334-2332_r2682p01_g.fits.fz

        data_path = settings.DATA_DIR

        relative_path = os.path.join('releases', tag, 'tiles', tilename)

        tile_path = os.path.join(data_path, relative_path)

        files = os.listdir(tile_path)

        data_source = os.path.join(settings.DATA_SOURCE, relative_path) + "/"

        result = list()

        ordered_filters = dict({})
        filters = Filter.objects.all().order_by('lambda_min')
        order = 0
        for f in filters:
            ordered_filters[f.filter] = order
            order += 1

        ordered_filters['det'] = order
        order += 1
        ordered_filters['irg'] = order

        for filename in files:

            file_source = urljoin(data_source, filename)

            extension = os.path.splitext(filename)[1]

            flr = None
            ord = None

            # Se for um arquivo de imagem descobrir o filtro
            if extension == '.fz':
                parts = filename.split('_')
                flr = parts[2].strip('_')
                flr = flr.split('.')[0]
                try:
                    ord = ordered_filters[flr]
                except:
                    pass

            if extension == '.tiff':
                parts = filename.split('_')
                flr = parts[2].strip('_')
                flr = flr.split('.')[0]
                try:
                    ord = ordered_filters[flr]
                except:
                    pass

            result.append(dict({
                'filename': filename,
                'file_source': file_source,
                'filter': flr,
                'order': ord
            }))

        # sql = (
        #     "SELECT m.filename, m.filetype, m.band, f.path FROM proctag t, file_archive_info f, miscfile m WHERE t.pfw_attempt_id = m.pfw_attempt_id AND t.tag='" + catalog + "' AND f.filename=m.filename AND m.filetype NOT IN ('coadd_head_scamp', 'mangle_molys', 'mangle_polygons', 'mangle_csv_ccdgon', 'mangle_csv_cobjmoly', 'mangle_csv_molyccd', 'mangle_csv_molyccd', 'mangle_csv_molygon', 'coadd_psfex_model', 'coadd_qa_scamp', 'coadd_xml_scamp', 'coadd_xml_psfex', 'coadd_det_psfex_model') AND m.tilename = '" + tilename + "' ORDER BY m.filetype, m.filename")
        #
        # db = DBBase('desoper')
        # tiles = db.engine.execute(sql)
        # fits_file = {}
        # result = []
        # for tile in tiles:
        #     url = "https://desar2.cosmology.illinois.edu/DESFiles/desarchive/%s/%s.fz" % (
        #         tile[3].replace("+", "%2B"), tile[0].replace("+", "%2B"))
        #     fits_file.update({'url': url})
        #
        #     fits_file.update({
        #         'tilename': tile[0]
        #     })
        #
        #     fits_file.update({
        #         'band': tile[2]
        #     })
        #     if tile[2] != None:
        #         result.append(copy.copy(fits_file))

        return Response(dict({'results': result}))


@ api_view(['GET'])
def install_delve_release(request):
    if request.method == 'GET':

        import logging
        from django.utils import timezone
        import humanize
        from common.download import Download

        log = logging.getLogger('delve_install_release')

        # tilenames = list(['DES0000-3540', 'DES0000-3623', 'DES0000-3706', 'DES0001-3457', 'DES0002-3332'])

        tilenames = list(['DES0000-3540', 'DES0000-3623', 'DES0000-3706', 'DES0001-3457', 'DES0002-3332', 'DES0002-3415', 'DES0002-3914', 'DES0002-3957', 'DES0002-4040', 'DES0002-4123', 'DES0002-4206', 'DES0002-4249', 'DES0002-4331', 'DES0002-4414', 'DES0003-3706', 'DES0003-3749', 'DES0003-3832', 'DES0004-3457', 'DES0004-3540', 'DES0004-3623', 'DES0005-3415', 'DES0006-3332', 'DES0006-3832', 'DES0006-3914', 'DES0006-3957', 'DES0006-4040', 'DES0006-4123', 'DES0006-4206', 'DES0006-4249', 'DES0006-4331', 'DES0006-4414', 'DES0007-3623', 'DES0007-3706', 'DES0007-3749', 'DES0008-3415', 'DES0008-3457', 'DES0008-3540', 'DES0009-3332', 'DES0010-3706', 'DES0010-3749', 'DES0010-3832', 'DES0010-3914', 'DES0010-3957', 'DES0010-4040', 'DES0010-4123', 'DES0010-4206', 'DES0010-4249', 'DES0010-4331', 'DES0010-4414', 'DES0011-3457', 'DES0011-3540', 'DES0011-3623', 'DES0012-3332', 'DES0012-3415', 'DES0013-3914', 'DES0013-3957', 'DES0013-4040', 'DES0013-4123', 'DES0014-3623', 'DES0014-3706', 'DES0014-3749', 'DES0014-3832', 'DES0014-4206', 'DES0014-4249', 'DES0014-4331', 'DES0014-4414', 'DES0015-3415', 'DES0015-3457', 'DES0015-3540', 'DES0017-3749', 'DES0017-3832', 'DES0017-3914', 'DES0017-3957', 'DES0017-4040', 'DES0017-4123', 'DES0017-4206', 'DES0018-3457', 'DES0018-3540', 'DES0018-3623', 'DES0018-3706', 'DES0018-4249', 'DES0018-4331', 'DES0018-4414', 'DES0019-3415', 'DES0021-3623', 'DES0021-3706', 'DES0021-3749', 'DES0021-3832', 'DES0021-3914', 'DES0021-3957', 'DES0021-4040', 'DES0021-4123', 'DES0021-4206', 'DES0022-3415', 'DES0022-3457', 'DES0022-3540', 'DES0022-4249', 'DES0022-4331', 'DES0022-4414', 'DES0025-3457', 'DES0025-3540', 'DES0025-3623', 'DES0025-3706', 'DES0025-3749', 'DES0025-3832', 'DES0025-3914', 'DES0025-3957', 'DES0025-4040', 'DES0025-4123', 'DES0025-4206', 'DES0025-4249', 'DES0026-4331', 'DES0026-4414', 'DES0028-3623', 'DES0028-3706', 'DES0028-3749', 'DES0028-3832', 'DES0028-3914', 'DES0028-3957', 'DES0028-4040', 'DES0029-3457', 'DES0029-3540', 'DES0029-4123', 'DES0029-4206', 'DES0029-4249', 'DES0030-4331', 'DES0030-4414', 'DES0032-3540', 'DES0032-3623', 'DES0032-3706', 'DES0032-3749', 'DES0032-3832', 'DES0032-3914', 'DES0032-3957', 'DES0032-4040', 'DES0033-4123', 'DES0033-4206', 'DES0033-4249', 'DES0034-4331', 'DES0034-4414', 'DES0035-3706', 'DES0035-3749', 'DES0035-3832', 'DES0036-3540', 'DES0036-3623', 'DES0036-3914', 'DES0036-3957', 'DES0036-4040', 'DES0036-4123', 'DES0037-4206', 'DES0037-4249', 'DES0038-4331', 'DES0039-3623', 'DES0039-3706', 'DES0039-3749', 'DES0039-3832', 'DES0039-3914', 'DES0040-3957', 'DES0040-4040', 'DES0040-4123', 'DES0043-3749', 'DES0043-3832', 'DES0043-3914', 'DES0043-3957', 'DES2343-4040', 'DES2347-3957', 'DES2347-4040', 'DES2347-4123', 'DES2348-3832', 'DES2348-3914', 'DES2350-4206', 'DES2351-3914', 'DES2351-3957', 'DES2351-4040', 'DES2351-4123', 'DES2352-3706', 'DES2352-3749', 'DES2352-3832', 'DES2353-3623', 'DES2354-4123', 'DES2354-4206', 'DES2354-4249', 'DES2354-4331', 'DES2355-3832', 'DES2355-3914', 'DES2355-3957', 'DES2355-4040', 'DES2356-3623', 'DES2356-3706', 'DES2356-3749', 'DES2357-3457', 'DES2357-3540', 'DES2358-3415', 'DES2358-4040', 'DES2358-4123', 'DES2358-4206', 'DES2358-4249', 'DES2358-4331', 'DES2359-3749', 'DES2359-3832', 'DES2359-3914', 'DES2359-3957', ])

        username = 'decade'
        password = 'decaFil3s'

        data_path = settings.DATA_DIR
        images_path = 'images/decade'

        # Fazer o Download dos arquivos PTIF

        tiles = list()
        for tilename in tilenames:
            log.info("--------- [%s] ---------" % tilename)

            ptif = '%s_r5230p01.ptif' % (tilename)
            # delve files URL
            file_url = 'https://decade.ncsa.illinois.edu/deca_archive/DEC/multiepoch/DECADE/r5230/%s/p01/qa/%s' % (tilename, ptif)

            log.info("URL: [%s]" % file_url)

            dest = os.path.join(data_path, images_path, tilename)
            log.info("Directory: [%s]" % dest)

            tile = dict({
                'tilename': tilename,
                'url': file_url,
                'filename': ptif
            })
            tiles.append(tile)
            # if not os.path.exists(dest):
            #     os.mkdir(dest)
            #     log.info("A directory has been created for Tile!")

            # log.info("Directory: [%s]" % dest)

            # filepath = os.path.join(dest, ptif)
            # if not os.path.exists(filepath):
            #     log.info("Downloading Ptif file.")

            #     try:
            #         t0 = timezone.now()

            #         d_file_path = Download().download_file_from_url(url=file_url, dir=dest, filename=ptif, auth=(username, password))

            #         size = os.path.getsize(d_file_path)
            #         hsize = Download().bytes2human(size)
            #         log.info("Size: %s" % hsize)

            #         t1 = timezone.now()
            #         tdelta = t0 - t1

            #         log.info("Download Time: %s " % humanize.naturaldelta(tdelta.total_seconds(), minimum_unit="microseconds"))
            #     except Exception as e:
            #         log.error(e)

            # else:
            #     log.info("Skipping the download because the ptif already exists!")

        return Response(dict({'tiles': tiles}))

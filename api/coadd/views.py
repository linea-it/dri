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


class ReleaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    queryset = Release.objects.filter(rls_disabled=False)

    serializer_class = ReleaseSerializer

    search_fields = ('rls_name', 'rls_display_name',)

    filter_fields = ('id', 'rls_name', 'rls_display_name',)

    ordering_fields = '__all__'


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
    queryset = Dataset.objects.select_related().all().prefetch_related('comments').prefetch_related('inspected')

    serializer_class = DatasetSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter)

    filter_class = DatasetFilter

    search_fields = ('tile__tli_tilename',)

    ordering_fields = ('tile__tli_tilename', 'date')

    ordering = ('tile__tli_tilename',)

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

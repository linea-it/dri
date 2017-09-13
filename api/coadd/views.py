import copy

import django_filters
from lib.sqlalchemy_wrapper import DBBase
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Release, Tag, Tile, Dataset, Survey
from .serializers import ReleaseSerializer, TagSerializer, TileSerializer, DatasetSerializer, \
    SurveySerializer, DatasetFootprintSerializer


# Create your views here.
class ReleaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    queryset = Release.objects.all()

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


class DatasetFilter(django_filters.FilterSet):
    tag__in = django_filters.MethodFilter()
    tli_tilename = django_filters.CharFilter(name='tile__tli_tilename', label='Tilename')
    position = django_filters.MethodFilter()

    class Meta:
        model = Dataset
        fields = ['id', 'tag', 'tile', 'tag__in', 'tli_tilename', ]
        order_by = True

    def filter_tag__in(self, queryset, value):
        return queryset.filter(tag__in=value.split(','))

    def filter_position(self, queryset, value):
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


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.select_related().all()

    serializer_class = DatasetSerializer

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = DatasetFilter

    ordering_fields = ('id', 'tag')


class DatasetFootprintViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.select_related().all()

    serializer_class = DatasetFootprintSerializer

    filter_backends = (filters.DjangoFilterBackend,)

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


@api_view(['GET'])
def get_fits_by_tilename(request):
    if request.method == 'GET':
        tilename = request.query_params.get('tilename', None)
        catalog = request.query_params.get('catalog', None)
        sql = (
            "SELECT m.filename, m.filetype, m.band, f.path FROM proctag t, file_archive_info f, miscfile m WHERE t.pfw_attempt_id = m.pfw_attempt_id AND t.tag='" + catalog + "' AND f.filename=m.filename AND m.filetype NOT IN ('coadd_head_scamp', 'mangle_molys', 'mangle_polygons', 'mangle_csv_ccdgon', 'mangle_csv_cobjmoly', 'mangle_csv_molyccd', 'mangle_csv_molyccd', 'mangle_csv_molygon', 'coadd_psfex_model', 'coadd_qa_scamp', 'coadd_xml_scamp', 'coadd_xml_psfex', 'coadd_det_psfex_model') AND m.tilename = '" + tilename + "' ORDER BY m.filetype, m.filename")

        db = DBBase('desoper')
        tiles = db.engine.execute(sql)
        fits_file = {}
        result = []
        for tile in tiles:
            url = "https://desar2.cosmology.illinois.edu/DESFiles/desarchive/%s/%s.fz" % (
                tile[3].replace("+", "%2B"), tile[0].replace("+", "%2B"))
            fits_file.update({'url': url})

            fits_file.update({
                'tilename': tile[0]
            })

            fits_file.update({
                'band': tile[2]
            })
            if tile[2] != None:
                result.append(copy.copy(fits_file))

        return Response(dict({'results': result}))

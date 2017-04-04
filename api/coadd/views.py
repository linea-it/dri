import logging

import django_filters
from django.db.models import Q
from rest_framework import filters
from rest_framework import viewsets
from .models import Release, Tag, Tile, Dataset, Survey
from .serializers import ReleaseSerializer, TagSerializer, TileSerializer, DatasetSerializer, \
    SurveySerializer, DatasetFootprintSerializer

logger = logging.getLogger(__name__)


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

        if (not ra > 0) or (not ra < 360):
            raise Exception(
                'Invalid format to coordinate. RA must be between 0 and 360 and Dec must be between -90 to 90.')

        # Normalizar o ra para -180 e 180 usar as colunas auxiliares urall_180 e uraur_180 para evitar problema
        # com objetos de ra entre 0 e 1
        if ra > 180:
            ra = (ra - 360)

        return queryset.filter(
            tile__tli_urall_180__lt=ra,
            tile__tli_udecll__lt=dec,
            tile__tli_uraur_180__gt=ra,
            tile__tli_udecur__gt=dec
        )




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

# class DatasetViewSet(viewsets.ViewSet,
#                      generics.GenericAPIView):
#
#     # queryset = Dataset.objects.select_related().all()
#
#     permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
#
#     serializer_class = DatasetSerializer
#
#
#     def get_queryset(self):
#         logger.info('-----------------get_queryset-----------')
#         pass
#
#     def retrieve(self, request, pk=None):
#
#         obj = get_object_or_404(Dataset, pk=pk)
#
#         serializer = DatasetSerializer(obj)
#
#         return Response(serializer.data)
#
#
#     def list(self, request):
#         logger.info('-----------------list---------------------')
#
#         tag = request.query_params.get('tag', None)
#         if tag:
#             queryset = get_list_or_404(Dataset.objects.select_related(), tag=tag)
#
#         tag_in = request.query_params.get('tag__in', None)
#         if tag_in:
#             ids = map(int, tag_in.split(','))
#
#             queryset = get_list_or_404(Dataset.objects.select_related(), tag__in=ids)
#
#         page = self.paginate_queryset(queryset)
#
#         logger.info('--------------------------------------')
#
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)
#
#         else:
#             serializer = DatasetSerializer(queryset, many=True)
#             content = Response({
#                 'count': len(queryset),
#                 'results': serializer.data,
#             })
#
#             return content

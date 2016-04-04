import logging

import django_filters
from coadd.models import Release, Tag, Tile, Tag_Tile
from coadd.serializers import ReleaseSerializer, TagSerializer, TileSerializer, DatasetSerializer
from rest_framework import filters
from rest_framework import viewsets

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

    class Meta:
        model = Tag_Tile
        fields = ['id', 'tag', 'tile', 'tag__in']

    def filter_tag__in(self, queryset, value):
        return queryset.filter(tag__in=value.split(','))



class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Tag_Tile.objects.select_related().all()

    serializer_class = DatasetSerializer

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = DatasetFilter

    # ordering_fields = ('id', 'tag')

# class DatasetViewSet(viewsets.ViewSet,
#                      generics.GenericAPIView):
#
#     # queryset = Tag_Tile.objects.select_related().all()
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
#         obj = get_object_or_404(Tag_Tile, pk=pk)
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
#             queryset = get_list_or_404(Tag_Tile.objects.select_related(), tag=tag)
#
#         tag_in = request.query_params.get('tag__in', None)
#         if tag_in:
#             ids = map(int, tag_in.split(','))
#
#             queryset = get_list_or_404(Tag_Tile.objects.select_related(), tag__in=ids)
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

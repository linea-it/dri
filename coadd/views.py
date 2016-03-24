import logging

from coadd.models import Release, Tag, Tile, Tag_Tile
from coadd.serializers import ReleaseSerializer, TagSerializer, TileSerializer, Tag_TileSerializer
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

    filter_fields = ('tag_release', 'tag_name', 'tag_display_name', 'tag_status',)

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


    # @list_route()
    # def by_tag(self, request):
    #     # logger.info("------------------------------------------------")
    #
    #     tag = request.query_params.get('tag', None)
    #
    #     # ordering = request.query_params.get()
    #
    #     tiles = Tile.objects.filter(tag=tag)
    #
    #     page = self.paginate_queryset(tiles)
    #
    #     logger.debug(page)
    #
    #     if page is not None:
    #         serializer = self.get_serializer(page, many=True)
    #
    #         return self.get_paginated_response(serializer.data)
    #
    #     else:
    #         serializer = self.get_serializer(tiles, many=True)
    #         content = {
    #             'results': serializer.data,
    #             'count': tiles.__len__()
    #         }
    #         return Response(content)


class Tag_TileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tag_tile to be viewed or edited
    """

    queryset = Tag_Tile.objects.all()

    serializer_class = Tag_TileSerializer

    filter_fields = ('id', 'tag', 'tile', 'run',)

    ordering_fields = '__all__'

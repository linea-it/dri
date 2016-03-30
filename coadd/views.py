import logging

from coadd.models import Release, Tag, Tile, Tag_Tile
from coadd.serializers import ReleaseSerializer, TagSerializer, TileSerializer, DatasetSerializer, Tag_TileSerializer
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
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


    # @list_route()
    # def by_tag(self, request):
    #
    #     logger.info("------------------------------------------------")
    #
    #     logger.debug(request)
    #
    #     tags = list()
    #
    #     tag = request.query_params.get('tag', None)
    #     logger.debug(tag)
    #     if tag:
    #         tags.append(tag)
    #
    #     tag_in = request.query_params.get('tag__in', None)
    #
    #     if tag_in:
    #         tags = map(int, tag_in.split(','))
    #
    #     resultset = list()
    #
    #     for id in tags:
    #         tags = Tag.objects.filter(pk=id)
    #         tag = tags[0]
    #
    #         release = tag.tag_release
    #
    #         tag_tiles = Tag_Tile.objects.filter(tag=id).select_related("tile", "tag")
    #
    #         for tt in tag_tiles:
    #             resultset.append(
    #                 dict(
    #                     id=tt.id,
    #                     tilename=tt.tile.tli_tilename,
    #                     tag=tt.tag,
    #                     release=release.pk,
    #                     run=tt.run,
    #                     tile=tt.tile
    #                 )
    #             )
    #
    #     # serializer = DatasetTilesSerializer(resultset, many=True)
    #
    #     serializer = DatasetSerializer(resultset, many=True)
    #
    #     logger.info("------------------------------------------------")
    #
    #     return Response(serializer.data)
    # ordering = request.query_params.get()

    # tiles = Tile.objects.filter(tag=tag)
    #
    # page = self.paginate_queryset(tiles)
    #
    # logger.debug(page)
    #
    # if page is not None:
    #     serializer = self.get_serializer(page, many=True)
    #
    #     return self.get_paginated_response(serializer.data)
    #
    # else:
    #     serializer = self.get_serializer(tiles, many=True)
    #     content = {
    #         'results': serializer.data,
    #         'count': tiles.__len__()
    #     }
    #     return Response(content)


class DatasetViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows datasets to be viewed
    """
    queryset = Tag_Tile.objects.all()

    serializer_class = Tag_TileSerializer

    filter_fields = ('id', 'tag', 'tile', 'run', 'tag_id')

    ordering_fields = '__all__'

    @list_route()
    def by_tag(self, request):

        ids = list()

        tag = request.query_params.get('tag', None)
        if tag:
            ids.append(tag)

        tag_in = request.query_params.get('tag__in', None)
        if tag_in:
            ids = map(int, tag_in.split(','))

        resultset = list()

        for id in ids:
            tag = Tag.objects.get(pk=id)
            release = tag.tag_release

            queryset = Tag_Tile.objects.filter(tag=id).select_related("tile", "tag")

            for row in queryset:
                resultset.append(
                    dict(
                        id=row.id,
                        tilename=row.tile.tli_tilename,
                        tag=row.tag,
                        release=release,
                        run=row.run,
                        tile=row.tile
                    )
                )

        page = self.paginate_queryset(resultset)

        if page is not None:
            serializer = DatasetSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        else:
            serializer = DatasetSerializer(resultset, many=True)
            content = Response({
                'results': serializer.data,
                'count': len(resultset)
            })

            return content

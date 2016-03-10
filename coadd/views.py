from django.shortcuts import render
from coadd.models import Release, Tag, Tile
from rest_framework import viewsets
from coadd.serializers import ReleaseSerializer, TagSerializer, TileSerializer
import django_filters
from rest_framework import filters

# Create your views here.
class ReleaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    queryset = Release.objects.all()

    serializer_class = ReleaseSerializer

    filter_backends = (filters.OrderingFilter,)

    ordering_fields = '__all__'


class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited
    """

    queryset = Tag.objects.all()

    serializer_class = TagSerializer


class TileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tile to be viewed or edited
    """

    queryset = Tile.objects.all()

    serializer_class = TileSerializer
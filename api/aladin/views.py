import django_filters
from rest_framework import viewsets
from rest_framework import filters
from .models import Image
from .serializers import ImageSerializer


class ImageFilter(django_filters.FilterSet):

    class Meta:
        model = Image
        fields = ['id', 'img_url', 'product']


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Image to be viewed or edited
    """

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = ImageFilter

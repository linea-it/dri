from rest_framework import viewsets
from .models import Image
from .serializers import ImageSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Image to be viewed or edited
    """

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filterset_fields = ['id', 'img_url', 'product']

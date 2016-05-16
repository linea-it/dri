import logging

from rest_framework import viewsets
from .models import ProductClass
from .serializers import ProductClassSerializer

logger = logging.getLogger(__name__)


# Create your views here.
class ProductClassViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product_class to be viewed or edited
    """

    queryset = ProductClass.objects.all()
    serializer_class = ProductClassSerializer
    search_fields = ('pcl_name', 'pcl_display_name')
    filter_fields = ('id', 'pcl_name', 'pcl_display_name')
    ordering_fields = ('id', 'pcl_name', 'pcl_display_name')

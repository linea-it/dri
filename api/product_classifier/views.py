from rest_framework import viewsets
from .models import ProductClass, ProductGroup
from .serializers import ProductClassSerializer, ProductGroupSerializer

class ProductClassViewSet(viewsets.ModelViewSet):

    queryset = ProductClass.objects.all()

    serializer_class = ProductClassSerializer

    search_fields = ('pcl_name', 'pcl_display_name')

    filter_fields = ('id', 'pcl_name', 'pcl_display_name')

    ordering_fields = ('id', 'pcl_name', 'pcl_display_name')


class ProductGroupViewSet(viewsets.ModelViewSet):
    queryset = ProductGroup.objects.all()

    serializer_class = ProductGroupSerializer

    search_fields = ('pgr_name', 'pgr_display_name')

    filter_fields = ('id', 'pgr_name', 'pgr_display_name', 'is_catalog')

    ordering_fields = ('pgr_name', 'pgr_display_name')

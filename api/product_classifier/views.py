import logging

import django_filters
from common.filters import *
from rest_framework import filters
from rest_framework import viewsets

from .models import ProductClass, ProductGroup
from .serializers import ProductClassSerializer, ProductGroupSerializer

logger = logging.getLogger(__name__)

class ProductClassViewSet(viewsets.ModelViewSet):

    queryset = ProductClass.objects.all()
    serializer_class = ProductClassSerializer
    search_fields = ('pcl_name', 'pcl_display_name')
    filter_fields = ('id', 'pcl_name', 'pcl_display_name')
    ordering_fields = ('id', 'pcl_name', 'pcl_display_name')

class ProductGroupFilter(django_filters.FilterSet):
    target = django_filters.MethodFilter()

    class Meta:
        model = ProductGroup
        fields = ['pgr_name', 'pgr_display_name', 'target']

    def filter_target(self, queryset, value):
        return queryset.filter(prd_class__pcl_group__pgr_name=value)


class ProductGroupViewSet(viewsets.ModelViewSet):

    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    
    filter_backends = (IsOwnerFilterBackend, filters.DjangoFilterBackend)

    filter_class = ProductGroupFilter

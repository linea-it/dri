import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

logger = logging.getLogger(__name__)


class ProductFilter(django_filters.FilterSet):
    group = django_filters.MethodFilter()

    class Meta:
        model = Product
        fields = ['prd_name', 'prd_display_name', 'prd_class', 'group']

    def filter_group(self, queryset, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Product.objects.select_related().all()

    serializer_class = ProductSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = ProductFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')

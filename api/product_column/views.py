from product_column.serializers import ColumnSerializer

from rest_framework import viewsets
from .models import ProductColumn


class ProductColumnViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product columns to be viewed or edited
    """
    queryset = ProductColumn.objects.select_related().all()

    serializer_class = ColumnSerializer

    filter_fields = ('id', 'pcl_product_id', 'pcl_column_name',)

    ordering_fields = ('id', 'pcl_column_name',)

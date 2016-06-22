from product_column.serializers import ColumnSerializer

from rest_framework import viewsets
from .models import Column


class ProductColumnViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product columns to be viewed or edited
    """
    queryset = Column.objects.select_related().all()

    serializer_class = ColumnSerializer

    filter_fields = ('id', 'clm_product_id', 'clm_column_name',)

    ordering_fields = ('id', 'clm_column_name',)

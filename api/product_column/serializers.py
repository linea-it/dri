from product.models import Product

from rest_framework import serializers
from .models import Column


class ColumnSerializer(serializers.HyperlinkedModelSerializer):
    clm_product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    class Meta:
        model = Column

        fields = (
            'id',
            'clm_product_id',
            'clm_column_name',
        )

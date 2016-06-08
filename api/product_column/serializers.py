from product.models import Product

from rest_framework import serializers
from .models import ProductColumn


class ColumnSerializer(serializers.HyperlinkedModelSerializer):
    pcl_product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    class Meta:
        model = ProductColumn

        fields = (
            'id',
            'pcl_product_id',
            'pcl_column_name',
        )

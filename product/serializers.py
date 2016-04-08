import logging

from rest_framework import serializers
from .models import Product
from product_classifier.models import ProductClass

logger = logging.getLogger(__name__)


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    prd_class = serializers.PrimaryKeyRelatedField(
        queryset=ProductClass.objects.all(), many=False)

    class Meta:

        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_class',
            'prd_flag_removed'
        )

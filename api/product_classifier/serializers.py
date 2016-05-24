import logging

from rest_framework import serializers
from .models import ProductClass, ProductGroup

logger = logging.getLogger(__name__)


class ProductClassSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = ProductClass

        fields = (
            'id',
            'pcl_name',
            'pcl_display_name',
            'pcl_is_system'
        )

class ProductGroupSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = ProductGroup

        fields = (
            'id',
            'pgr_name',
            'pgr_display_name'
        )


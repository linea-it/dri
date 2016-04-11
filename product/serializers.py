import logging

from rest_framework import serializers
from .models import Product
from .models import File
from .models import Table
from .models import Catalog
from .models import Map
from .models import Mask 
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
        
class FileSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = File

        fields = (
            'id',
            'fli_base_path',
            'fli_name'
        )

class TableSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Table
        
        fields = (
            'id',
            'tbl_schema',
            'tbl_name'
        )

class CatalogSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Catalog

        fields = (
            'id',
            'ctl_num_columns',
            'ctl_num_tiles',
            'ctl_num_objects'
        )

class MapSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Map

        fields = (
            'id',
            'mpa_nside',
            'mpa_filter',
            'mpa_ordering'
        )

class MaskSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Mask
        
        fields = (
            'id',
            'msk_filter'
        )

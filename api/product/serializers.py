import logging

from product_classifier.models import ProductClass

from rest_framework import serializers
from .models import File
from .models import Map
from .models import Mask
from .models import Product
from .models import Table

logger = logging.getLogger(__name__)


class ProductSerializer(serializers.HyperlinkedModelSerializer):
    prd_class = serializers.PrimaryKeyRelatedField(
        queryset=ProductClass.objects.all(), many=False)

    # Atributos da product_classifier.ProductClass
    # pcl_name = serializers.SerializerMethodField()
    pcl_display_name = serializers.SerializerMethodField()
    pcl_is_system = serializers.SerializerMethodField()

    # Atributos da product_classifier.ProductGroup
    pgr_group = serializers.SerializerMethodField()
    # pgr_name = serializers.SerializerMethodField()
    pgr_display_name = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_flag_removed',
            'prd_class',
            # 'pcl_name',
            'pcl_display_name',
            'pcl_is_system',
            'pgr_group',
            # 'pgr_name',
            'pgr_display_name'
        )

    def get_pcl_name(self, obj):
        return obj.prd_class.pcl_name

    def get_pcl_display_name(self, obj):
        return obj.prd_class.pcl_display_name

    def get_pcl_is_system(self, obj):
        return obj.prd_class.pcl_is_system

    def get_pgr_group(self, obj):
        return obj.prd_class.pcl_group.id

    def get_pgr_name(self, obj):
        return obj.prd_class.pcl_group.pgr_name

    def get_pgr_display_name(self, obj):
        return obj.prd_class.pcl_group.pgr_display_name


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
    prd_class = serializers.PrimaryKeyRelatedField(
        queryset=ProductClass.objects.all(), many=False)

    # Atributos da product_classifier.ProductClass
    # pcl_name = serializers.SerializerMethodField()
    pcl_display_name = serializers.SerializerMethodField()
    pcl_is_system = serializers.SerializerMethodField()

    # Atributos da product_classifier.ProductGroup
    pgr_group = serializers.SerializerMethodField()
    # pgr_name = serializers.SerializerMethodField()
    pgr_display_name = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_flag_removed',
            'prd_class',
            # 'pcl_name',
            'pcl_display_name',
            'pcl_is_system',
            'pgr_group',
            # 'pgr_name',
            'pgr_display_name',
        )

    def get_pcl_name(self, obj):
        return obj.prd_class.pcl_name

    def get_pcl_display_name(self, obj):
        return obj.prd_class.pcl_display_name

    def get_pcl_is_system(self, obj):
        return obj.prd_class.pcl_is_system

    def get_pgr_group(self, obj):
        return obj.prd_class.pcl_group.id

    def get_pgr_name(self, obj):
        return obj.prd_class.pcl_group.pgr_name

    def get_pgr_display_name(self, obj):
        return obj.prd_class.pcl_group.pgr_display_name


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

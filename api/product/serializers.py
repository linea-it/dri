import logging

from product_classifier.models import ProductClass

from rest_framework import serializers
from .models import File, Catalog
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

    # Atributos da product_register.ExternalProcess
    epr_original_id = serializers.SerializerMethodField()
    epr_name = serializers.SerializerMethodField()
    epr_username = serializers.SerializerMethodField()
    epr_start_date = serializers.SerializerMethodField()
    epr_end_date = serializers.SerializerMethodField()
    epr_readme = serializers.SerializerMethodField()
    epr_comment = serializers.SerializerMethodField()

    # epr_site = models.CharField(max_length=128)


    class Meta:
        model = Catalog

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
            'ctl_num_columns',
            'ctl_num_tiles',
            'ctl_num_objects',
            'epr_original_id',
            'epr_name',
            'epr_username',
            'epr_start_date',
            'epr_end_date',
            'epr_readme',
            'epr_comment',
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

    def get_epr_original_id(self, obj):
        return obj.prd_process_id.epr_original_id

    def get_epr_name(self, obj):
        return obj.prd_process_id.epr_name

    def get_epr_username(self, obj):
        return obj.prd_process_id.epr_username

    def get_epr_start_date(self, obj):
        return obj.prd_process_id.epr_start_date

    def get_epr_end_date(self, obj):
        return obj.prd_process_id.epr_end_date

    def get_epr_readme(self, obj):
        return obj.prd_process_id.epr_readme

    def get_epr_comment(self, obj):
        return obj.prd_process_id.epr_comment


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

import logging

from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ExternalProcess
from rest_framework import serializers

from .models import File, Catalog, ProductContent, ProductContentAssociation
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
    prd_process_id = serializers.PrimaryKeyRelatedField(
        queryset=ExternalProcess.objects.all(), many=False)

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
            'prd_process_id',
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
            'ctl_num_objects',
            'epr_original_id',
            'epr_name',
            'epr_username',
            'epr_start_date',
            'epr_end_date',
            'epr_readme',
            'epr_comment',
            'tbl_schema',
            'tbl_name'
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
            'mpa_ordering'
        )

class MaskSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Mask
        
        fields = (
            'id',
            'msk_filter'
        )

class ProductContentSerializer(serializers.HyperlinkedModelSerializer):
    pcn_product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    class Meta:
        model = ProductContent

        fields = (
            'id',
            'pcn_product_id',
            'pcn_column_name',
        )


class ProductContentAssociationSerializer(serializers.HyperlinkedModelSerializer):
    pca_product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    pca_class_content = serializers.PrimaryKeyRelatedField(
        queryset=ProductClassContent.objects.all(), many=False)

    pca_product_content = serializers.PrimaryKeyRelatedField(
        queryset=ProductContent.objects.all(), many=False)

    # Atributos da  product_classifier.ProductClassContent
    pcc_category = serializers.SerializerMethodField()
    pcc_display_name = serializers.SerializerMethodField()
    pcc_ucd = serializers.SerializerMethodField()
    pcc_unit = serializers.SerializerMethodField()
    pcc_reference = serializers.SerializerMethodField()
    pcc_mandatory = serializers.SerializerMethodField()

    # Atributos da  product.ProductContent
    pcn_column_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductContentAssociation

        fields = (
            'id',
            'pca_product',
            'pca_class_content',
            'pca_product_content',
            'pcc_category',
            'pcc_display_name',
            'pcc_ucd',
            'pcc_unit',
            'pcc_reference',
            'pcc_mandatory',
            'pcn_column_name'
        )

        read_only_fields = ('id')

    def get_pcc_category(self, obj):
        return obj.pca_class_content.pcc_category.cct_name

    def get_pcc_display_name(self, obj):
        return obj.pca_class_content.pcc_display_name

    def get_pcc_ucd(self, obj):
        return obj.pca_class_content.pcc_ucd

    def get_pcc_unit(self, obj):
        return obj.pca_class_content.pcc_unit

    def get_pcc_reference(self, obj):
        return obj.pca_class_content.pcc_reference

    def get_pcc_mandatory(self, obj):
        return obj.pca_class_content.pcc_mandatory

    def get_pcn_column_name(self, obj):
        return obj.pca_product_content.pcn_column_name


class AssociationSerializer(serializers.HyperlinkedModelSerializer):
    # Atributos da  product_classifier.ProductClassContent
    pcc_ucd = serializers.SerializerMethodField()

    # Atributos da  product.ProductContent
    pcn_column_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductContentAssociation

        fields = (
            'pcc_ucd',
            'pcn_column_name'
        )

    def get_pcc_ucd(self, obj):
        return obj.pca_class_content.pcc_ucd

    def get_pcn_column_name(self, obj):
        return obj.pca_product_content.pcn_column_name


class ProductAssociationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductContentAssociation

        fields = (
            'id',
            'pca_product',
            'pca_class_content',
            'pca_product_content',
        )

        read_only_fields = ('id')


class AllProductsSerializer(serializers.HyperlinkedModelSerializer):
    ctl_num_objects = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_flag_removed',
            'ctl_num_objects'
        )
    
    def get_ctl_num_objects(self, obj):
        try:
            return obj.table.catalog.ctl_num_objects
        except AttributeError:
            return None



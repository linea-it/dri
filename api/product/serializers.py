import logging

from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ExternalProcess
from rest_framework import serializers

from .models import Product, Map, Mask, Table, ProductSetting, CurrentSetting, ProductContentSetting, CutOutJob, File, Catalog, ProductContent, ProductContentAssociation

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
            'prd_user_display_name',
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
    release_display_name = serializers.SerializerMethodField()

    class Meta:
        model = Catalog

        fields = (
            'id',
            'prd_process_id',
            'prd_name',
            'prd_display_name',
            'prd_user_display_name',
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
            'tbl_name',
            'release_display_name'
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

    def get_release_display_name(self, obj):
        try:
           r = obj.productrelease_set.first()
           return r.release.rls_display_name
        except:
            return None



class MapSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Map

        fields = (
            'id',
            'mpa_nside',
            'mpa_ordering',
        )

class CutOutJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = CutOutJob

        fields = (
            'cjb_product',
            'cjb_display_name',
            'cjb_status',
            'cjb_job_id',
            'cjb_xsize',
            'cjb_ysize',
            'cjb_job_type',
            'cjb_band',
            'cjb_Blacklist',
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
        try:
            return obj.pca_class_content.pcc_category.cct_name
        except:
            return None

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
            'pca_setting',
        )

        read_only_fields = ('id')


class AllProductsSerializer(serializers.HyperlinkedModelSerializer):
    ctl_num_objects = serializers.SerializerMethodField()
    tbl_rows = serializers.SerializerMethodField()
    mpa_nside = serializers.SerializerMethodField()
    mpa_ordering = serializers.SerializerMethodField()
    prd_table_ptr = serializers.SerializerMethodField()
    pgr_display_name = serializers.SerializerMethodField()
    pcl_display_name = serializers.SerializerMethodField()
    prd_process_id = serializers.PrimaryKeyRelatedField(
        queryset=ExternalProcess.objects.all(), many=False)
    epr_username = serializers.SerializerMethodField()
    epr_end_date = serializers.SerializerMethodField()
    epr_original_id = serializers.SerializerMethodField()
    exp_username = serializers.SerializerMethodField()
    exp_date = serializers.SerializerMethodField()
    # Dados do Release
    prd_release_id = serializers.SerializerMethodField()
    prd_release_display_name = serializers.SerializerMethodField()
    # Dados do Field
    prd_tags = serializers.SerializerMethodField()
    prd_tags_name = serializers.SerializerMethodField()

    prd_filter = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_user_display_name',
            'prd_flag_removed',
            'ctl_num_objects',
            'tbl_rows',
            'mpa_nside',
            'mpa_ordering',
            "pgr_display_name",
            'pcl_display_name',
            'prd_process_id',
            'epr_username',
            'epr_end_date',
            'prd_release_id',
            'prd_release_display_name',
            'prd_tags',
            'prd_tags_name',
            'epr_original_id',
            'prd_filter',
            'prd_table_ptr',
            'exp_username',
            'exp_date'

        )

    def get_ctl_num_objects(self, obj):
        try:
            return obj.table.catalog.ctl_num_objects
        except AttributeError:
            return None

    def get_tbl_rows(self, obj):
        try:
            return obj.table.catalog.tbl_rows
        except AttributeError:
            return None

    def get_prd_filter(self, obj):
        try:
            return obj.prd_filter.filter

        except AttributeError:
            return None

    def get_mpa_nside(self, obj):
        try:
            return obj.table.map.mpa_nside
        except AttributeError:
            return None

    def get_mpa_ordering(self, obj):
        try:
            return obj.table.map.mpa_ordering
        except AttributeError:
            return None

    def get_prd_table_ptr(self, obj):
        try:
            return str(obj.table.map.table_ptr)
        except AttributeError:
            return str(obj.table.catalog.table_ptr)

    def get_pgr_display_name(self, obj):
        return obj.prd_class.pcl_group.pgr_display_name

    def get_pcl_display_name(self, obj):
        return obj.prd_class.pcl_display_name

    def get_epr_original_id(self, obj):
        return obj.prd_process_id.epr_original_id

    def get_epr_username(self, obj):
        return obj.prd_process_id.epr_username
    
    def get_epr_end_date(self, obj):
        return obj.prd_process_id.epr_end_date
    
    def get_exp_username(self, obj):
        try:
            r = obj.prd_process_id.export_set.first()
            return r.exp_username
        except AttributeError:
            return None

    def get_exp_date(self, obj):
        try:
            r = obj.prd_process_id.export_set.first()
            return r.exp_date
        except AttributeError:
            return None
            
    def get_prd_release_id(self, obj):
        try:
            r = obj.releases.first()
            return r.id
        except AttributeError:
            return None

    def get_prd_release_display_name(self, obj):
        try:
            r = obj.releases.first()
            return r.rls_display_name
        except AttributeError:
            return None

    def get_prd_tags_name(self, obj):
        try:
            tags = list()
            for tag in obj.tags.values():
                tags.append(tag.get('tag_display_name'))

            return tags
        except AttributeError:
            return None

    def get_prd_tags(self, obj):
        try:
            tags = list()
            for tag in obj.tags.values():
                tags.append(tag.get('id'))

            return tags
        except AttributeError:
            return None


class ProductSettingSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    editable = serializers.SerializerMethodField()

    class Meta:
        model = ProductSetting

        fields = (
            'id',
            'cst_product',
            'cst_display_name',
            'cst_description',
            'cst_is_public',
            'cst_is_editable',
            'owner',
            'editable'
        )

    def get_owner(self, obj):
        return obj.owner.username

    def get_editable(self, obj):
        current_user = self.context['request'].user
        if obj.owner.pk == current_user.pk:
            return True
        else:
            return obj.cst_is_editable


class CurrentSettingSerializer(serializers.ModelSerializer):
    editable = serializers.SerializerMethodField()

    class Meta:
        model = CurrentSetting

        fields = (
            'id',
            'cst_product',
            'cst_setting',
            'editable'
        )

    def get_editable(self, obj):
        current_user = self.context['request'].user
        if obj.cst_setting.owner.pk == current_user.pk:
            return True
        else:
            return obj.cst_setting.cst_is_editable


class ProductContentSettingSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductContentSetting

        fields = (
            'id',
            'pcs_content',
            'pcs_setting',
            'pcs_is_visible',
            'pcs_order',
            'display_name'
        )

    def get_display_name(self, obj):

        association = obj.pcs_content.productcontentassociation_set.filter(pca_setting=obj.pcs_setting).first()
        if association is not None:
            return association.pca_class_content.pcc_display_name
        else:
            return obj.pcs_content.pcn_column_name

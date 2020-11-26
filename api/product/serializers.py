import datetime
import logging
import os
import time
from urllib.parse import urljoin

import humanize
from django.contrib.auth.models import User
from django.db.models import Sum
from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ExternalProcess
from rest_framework import serializers

from .models import *

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

    # epr_original_id = Original Process ID
    epr_original_id = serializers.SerializerMethodField()

    # epr_original_id = Original Process ID
    prd_filter = serializers.SerializerMethodField()

    # Related Products
    prl_related = serializers.SerializerMethodField()
    prl_cross_identification = serializers.SerializerMethodField()
    prl_cross_property = serializers.SerializerMethodField()

    tablename = serializers.SerializerMethodField()

    productlog = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            'id',
            'prd_name',
            'prd_display_name',
            'prd_user_display_name',
            'prd_class',
            'prd_is_public',
            # 'pcl_name',
            'pcl_display_name',
            'pcl_is_system',
            'pgr_group',
            # 'pgr_name',
            'pgr_display_name',
            'epr_original_id',
            'prd_filter',
            'prl_related',
            'prl_cross_identification',
            'prl_cross_property',
            'tablename',
            'productlog'
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
        try:
            return obj.prd_process_id.epr_original_id
        except:
            return None

    def get_prd_filter(self, obj):
        try:
            return obj.prd_filter.filter
        except:
            return None

    def get_prl_related(self, obj):
        try:
            related = ProductRelated.objects.get(prl_product=obj.pk, prl_relation_type="join")
            return related.prl_related.pk
        except:
            return None

    def get_prl_cross_identification(self, obj):
        try:
            related = ProductRelated.objects.get(prl_product=obj.pk, prl_relation_type="join")
            return related.prl_cross_identification.pk
        except:
            return None

    def get_prl_cross_property(self, obj):
        try:
            related = ProductRelated.objects.get(prl_product=obj.pk, prl_relation_type="join")
            return related.prl_cross_identification.pcn_column_name.lower()
        except:
            return None

    def get_tablename(self, obj):
        try:
            if obj.table.tbl_schema is not None:
                return "%s.%s" % (obj.table.tbl_schema, obj.table.tbl_name)
            else:
                return obj.table.tbl_name
        except:
            return None

    def get_productlog(self, obj):
        try:
            site = obj.prd_process_id.epr_site.sti_url
            return urljoin(site, "VP/getViewProcessCon?process_id=%s" % obj.prd_process_id.epr_original_id)

        except:
            return None


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
    owner = serializers.SerializerMethodField()
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
    release_id = serializers.SerializerMethodField()
    release_display_name = serializers.SerializerMethodField()

    is_owner = serializers.SerializerMethodField()

    tbl_rows = serializers.SerializerMethodField()

    class Meta:
        model = Catalog

        fields = (
            'id',
            'owner',
            'prd_process_id',
            'prd_name',
            'prd_display_name',
            'prd_user_display_name',
            'prd_class',
            'prd_date',
            'prd_is_public',

            'pcl_display_name',
            'pcl_is_system',

            'pgr_group',
            'pgr_display_name',

            'epr_original_id',
            'epr_name',
            'epr_username',
            'epr_start_date',
            'epr_end_date',
            'epr_readme',
            'epr_comment',

            'tbl_schema',
            'tbl_name',
            'tbl_size',
            'tbl_num_columns',
            'tbl_rows',

            'release_id',
            'release_display_name',

            'is_owner'
        )

    def get_owner(self, obj):
        try:
            return obj.prd_owner.username
        except:
            return None

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
        try:
            return obj.prd_process_id.epr_original_id
        except:
            return None

    def get_epr_name(self, obj):
        try:
            return obj.prd_process_id.epr_name
        except:
            return None

    def get_epr_username(self, obj):
        try:
            return obj.prd_process_id.epr_username
        except:
            return None

    def get_epr_start_date(self, obj):
        try:
            return obj.prd_process_id.epr_start_date
        except:
            return None

    def get_epr_end_date(self, obj):
        try:
            return obj.prd_process_id.epr_end_date
        except:
            return None

    def get_epr_readme(self, obj):
        try:
            return obj.prd_process_id.epr_readme
        except:
            return None

    def get_epr_comment(self, obj):
        try:
            return obj.prd_process_id.epr_comment
        except:
            return None

    def get_release_id(self, obj):
        try:
            r = obj.productrelease_set.first()
            return r.release.id
        except:
            return None

    def get_release_display_name(self, obj):
        try:
            r = obj.productrelease_set.first()
            return r.release.rls_display_name
        except:
            return None

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.prd_owner.pk == current_user.pk:
            return True
        else:
            return False

    def get_tbl_rows(self, obj):
        if obj.tbl_rows is None:
            return obj.ctl_num_objects
        else:
            return obj.tbl_rows


class MapSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        model = Map

        fields = ProductSerializer.Meta.fields + ('id', 'mpa_nside', 'mpa_ordering')


class CutoutJobSerializer(serializers.HyperlinkedModelSerializer):
    cjb_product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    owner = serializers.SerializerMethodField()
    execution_time = serializers.SerializerMethodField()
    h_file_sizes = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    status_name = serializers.CharField(
        source='get_cjb_status_display', read_only=True
    )

    class Meta:
        model = CutOutJob

        fields = (
            'id',
            'cjb_product',
            'cjb_display_name',
            'cjb_status',
            'status_name',
            'cjb_tag',
            'cjb_xsize',
            'cjb_ysize',
            'cjb_make_fits',
            'cjb_fits_colors',
            'cjb_make_stiff',
            'cjb_stiff_colors',
            'cjb_make_lupton',
            'cjb_lupton_colors',
            'cjb_label_position',
            'cjb_label_properties',
            'cjb_label_colors',
            'cjb_label_font_size',
            'cjb_start_time',
            'cjb_finish_time',
            'cjb_description',
            'cjb_files',
            'cjb_file_size',
            'cjb_error',
            'owner',
            'execution_time',
            'h_file_sizes',
            'is_owner'
        )

    def get_owner(self, obj):
        return obj.owner.username

    def get_execution_time(self, obj):
        try:
            tdelta = obj.cjb_finish_time - obj.cjb_start_time
            seconds = tdelta.total_seconds()
            execution_time = str(datetime.timedelta(seconds=seconds)).split('.')[0]

            return execution_time
        except:
            return None

    def get_h_file_sizes(self, obj):
        try:
            return humanize.naturalsize(obj.cjb_file_size)
        except:
            return None

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.owner.pk == current_user.pk:
            return True
        else:
            return False


class CutoutSerializer(serializers.HyperlinkedModelSerializer):
    cjb_cutout_job = serializers.PrimaryKeyRelatedField(
        queryset=CutOutJob.objects.all(), many=False)

    ctt_file_source = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Cutout

        fields = (
            'id',
            'cjb_cutout_job',
            'ctt_object_id',
            'ctt_object_ra',
            'ctt_object_dec',
            'ctt_img_format',
            'ctt_filter',
            # 'ctt_file_path',
            'ctt_file_name',
            'ctt_file_type',
            'ctt_file_size',
            'ctt_file_source',
            'timestamp'
        )

    def get_ctt_file_source(self, obj):
        try:
            cutout_source = settings.DES_CUTOUT_SERVICE['CUTOUT_SOURCE']

            if obj.ctt_file_path is not None:

                source = os.path.join(cutout_source, obj.ctt_file_path)

                return source
            else:
                return None

        except KeyError as e:
            raise Exception("The CUTOUT_SOURCE parameter has not been configured, "
                            " add this attribute to the DES_CUTOUT_SERVICE section.")

        except Exception as e:
            raise (e)

    def get_timestamp(self, obj):
        return time.time()


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
            'pcn_column_name',
        )

        read_only_fields = ('id',)

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
    # Atributos da  product_classifier.ProductClassContent
    pcc_ucd = serializers.SerializerMethodField()

    # Atributos da  product.ProductContent
    pcn_column_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductContentAssociation

        fields = (
            'id',
            'pca_product',
            'pca_class_content',
            'pca_product_content',
            'pcc_ucd',
            'pcn_column_name'
        )

        read_only_fields = ('id',)

    def get_pcc_ucd(self, obj):
        return obj.pca_class_content.pcc_ucd

    def get_pcn_column_name(self, obj):
        return obj.pca_product_content.pcn_column_name.lower()


class ProductRelatedSerializer(serializers.ModelSerializer):
    prl_cross_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductRelated

        fields = (
            'id',
            'prl_product',
            'prl_related',
            'prl_relation_type',
            'prl_cross_identification',
            'prl_cross_name'
        )

    def get_prl_cross_name(self, obj):
        try:
            return obj.prl_cross_identification.pcn_column_name

        except:
            return None


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
    unit = serializers.SerializerMethodField()

    class Meta:
        model = ProductContentSetting

        fields = (
            'id',
            'pcs_content',
            'pcs_setting',
            'pcs_is_visible',
            'pcs_order',
            'display_name',
            'unit'
        )

    def get_display_name(self, obj):
        try:
            association = obj.pcs_content.productcontentassociation_set.first()
            return association.pca_class_content.pcc_display_name
        except:
            return obj.pcs_content.pcn_column_name

    def get_unit(self, obj):
        try:
            association = obj.pcs_content.productcontentassociation_set.first()
            return association.pca_class_content.pcc_unit
        except:
            return None


class PermissionUserSerializer(serializers.ModelSerializer):
    prm_product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)
    prm_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=False)
    username = serializers.SerializerMethodField()

    class Meta:
        model = Permission

        fields = (
            'id',
            'prm_product',
            'prm_user',
            'username',
        )

    def get_username(self, obj):
        return obj.prm_user.username


class PermissionWorkgroupUserSerializer(serializers.ModelSerializer):
    wgu_workgroup = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)
    wgu_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=False)

    workgroup = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Permission

        fields = (
            'id',
            'wgu_workgroup',
            'wgu_user',
            'workgroup',
            'username'
        )

    def get_workgroup(self, obj):
        return obj.wgu_workgroup.wgp_workgroup

    def get_username(self, obj):
        return obj.wgu_user.username


class PermissionSerializer(serializers.ModelSerializer):
    prm_product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)
    prm_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=False, allow_null=True)
    prm_workgroup = serializers.PrimaryKeyRelatedField(queryset=Workgroup.objects.all(), many=False, allow_null=True)

    class Meta:
        model = Permission

        fields = (
            'id',
            'prm_product',
            'prm_user',
            'prm_workgroup',
        )


class WorkgroupSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Workgroup

        fields = (
            'id',
            'wgp_workgroup',
            'owner',
        )


class WorkgroupUserSerializer(serializers.ModelSerializer):
    wgu_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=False, allow_null=True)
    wgu_workgroup = serializers.PrimaryKeyRelatedField(queryset=Workgroup.objects.all(), many=False, allow_null=True)
    username = serializers.SerializerMethodField()

    class Meta:
        model = WorkgroupUser

        fields = (
            'id',
            'wgu_workgroup',
            'wgu_user',
            'username'
        )

    def get_username(self, obj):
        return obj.wgu_user.username


class FiltersetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filterset

        fields = (
            'id',
            'product',
            'fst_name'
        )


class FilterConditionSerializer(serializers.ModelSerializer):
    property_name = serializers.SerializerMethodField()
    property_display_name = serializers.SerializerMethodField()
    operator_display_name = serializers.SerializerMethodField()

    class Meta:
        model = FilterCondition

        fields = (
            'id',
            'filterset',
            'fcd_property',
            'fcd_property_name',
            'fcd_operation',
            'fcd_value',
            'property_name',
            'property_display_name',
            'operator_display_name'
        )

    def get_property_name(self, obj):
        try:
            return obj.fcd_property.pcn_column_name
        except:
            return obj.fcd_property_name

    def get_property_display_name(self, obj):
        try:
            association = obj.fcd_property.productcontentassociation_set.first()
            return association.pca_class_content.pcc_display_name
        except:
            try:
                return obj.pcs_content.pcn_column_name
            except:
                return obj.fcd_property_name

    def get_operator_display_name(self, obj):
        try:
            operators = dict({
                '=': 'is equal to',
                '!=': 'is not equal to',
                '>': 'is greater than',
                '>=': 'is greater than or equal to',
                '<': 'is less than',
                '<=': 'is less than or equal to'
            })

            return operators.get(obj.fcd_operation)
        except:
            return None


class FConditionSerializer(serializers.ModelSerializer):
    """
    Este serializer e uma versao menor  do FilterConditionSerializer
    contendo apenas os atributos para criar a clausula where no formato SQLAlchemy
    https://github.com/zzzeek/sqlalchemy/blob/master/lib/sqlalchemy/sql/operators.py#L16
    """
    column = serializers.SerializerMethodField()
    op = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    class Meta:
        model = FilterCondition

        fields = (
            'column',
            'op',
            'value',
        )

    def get_column(self, obj):
        property = ""
        try:
            property = obj.fcd_property.pcn_column_name
        except:
            property = obj.fcd_property_name

        property.lower().strip()

        return property

    def get_op(self, obj):

        op = obj.fcd_operation
        if op == "=":
            op = "eq"

        elif op == "!=":
            op = "ne"

        elif op == "<":
            op = "lt"

        elif op == "<=":
            op = "le"

        elif op == ">":
            op = "gt"

        elif op == ">=":
            op = "ge"

        return op

    def get_value(self, obj):
        return obj.fcd_value


# ---------------------------------- Bookmark ----------------------------------

class BookmarkedSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = BookmarkProduct

        fields = (
            'id',
            'product',
            'owner',
            'is_starred',
            'is_owner'
        )

    def get_owner(self, obj):
        return obj.owner.username

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.owner.pk == current_user.pk:
            return True
        else:
            return False

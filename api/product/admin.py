from django.contrib import admin

from .models import *


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_process_id', 'prd_name',
                    'prd_display_name', 'prd_owner', 'prd_product_id', 'prd_date',
                    'prd_class', 'prd_filter', 'prd_is_public', 'prd_is_permanent',)
    list_display_links = ('id', 'prd_process_id', 'prd_name',)
    search_fields = ('prd_process_id', 'prd_name', 'prd_display_name', 'prd_product_id',)


class ProductReleaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'release',)
    list_display_links = ('id', 'product', 'release',)
    search_fields = ('product', 'release',)


class ProductTagAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'tag',)
    list_display_links = ('id', 'product', 'tag',)
    search_fields = ('product', 'tag',)


class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_name', 'prd_display_name',
                    'prd_class', 'fli_base_path', 'fli_name',)
    list_display_links = ('id', 'prd_name', 'prd_display_name', 'prd_class',)
    search_fields = ('fli_name',)


class TableAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_name', 'prd_display_name',
                    'prd_class', 'tbl_database', 'tbl_schema', 'tbl_name',)
    list_display_links = ('id', 'prd_name', 'prd_display_name',
                          'prd_class', 'tbl_schema', 'tbl_name',)
    search_fields = ('tbl_schema', 'tbl_name',)


class CatalogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'ctl_num_objects',
    )


class MapAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'mpa_nside', 'mpa_ordering',
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('prd_name',)


class CutOutJobAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'cjb_product', 'cjb_display_name', 'cjb_status', 'cjb_job_type', 'cjb_tag', 'cjb_job_id', 'owner',
    )
    list_display_links = ('id',)
    search_fields = ('cjb_display_name',)


class CutoutAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'cjb_cutout_job', 'ctt_object_id', 'ctt_object_ra', 'ctt_object_dec', 'ctt_filter', 'ctt_thumbname',
        'ctt_file_name', 'ctt_file_path', 'ctt_file_type', 'ctt_file_size', 'ctt_download_start_time',
        'ctt_download_finish_time',
    )
    list_display_links = ('id',)
    search_fields = ('id',)


class MaskAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'msk_filter',
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('prd_name',)


class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'pcn_product_id', 'pcn_column_name', 'pcn_ucd')
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)


class ProductContentAssociationAdmin(admin.ModelAdmin):
    list_display = ('id', 'pca_product', 'pca_class_content', 'pca_product_content',)
    search_fields = ('pca_product__prd_display_name', 'pca_product__prd_name')


class ProductContentSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'pcs_content', 'pcs_setting', 'pcs_is_visible', 'pcs_order')


class ProductSettingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'cst_product', 'owner', 'cst_display_name', 'cst_description', 'cst_is_public', 'cst_is_editable',)
    search_fields = ('cst_product__prd_display_name', 'cst_display_name', 'cst_description',)


class CurrentSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'cst_product', 'cst_setting', 'owner',)


class WorkgroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'wgp_workgroup', 'owner',)


class WorkgroupUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'wgu_workgroup', 'wgu_user',)


class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'prm_product', 'prm_user', 'prm_workgroup',)


class ProductRelatedAdmin(admin.ModelAdmin):
    list_display = ('id', 'prl_product', 'prl_related', 'prl_relation_type', 'prl_cross_identification',)


class FiltersetdAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'owner', 'fst_name',)


class FilterConditionAdmin(admin.ModelAdmin):
    list_display = ('id', 'filterset', 'fcd_property', 'fcd_property_name', 'fcd_operation', 'fcd_value')

class BookmarkedAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'owner', 'is_starred')


admin.site.register(Product, ProductAdmin)
admin.site.register(ProductRelease, ProductReleaseAdmin)
admin.site.register(ProductTag, ProductTagAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(Table, TableAdmin)
admin.site.register(Catalog, CatalogAdmin)
admin.site.register(Map, MapAdmin)
admin.site.register(CutOutJob, CutOutJobAdmin)
admin.site.register(Cutout, CutoutAdmin)
admin.site.register(Mask, MaskAdmin)
admin.site.register(ProductContent, ProductContentAdmin)
admin.site.register(ProductContentAssociation, ProductContentAssociationAdmin)
admin.site.register(ProductContentSetting, ProductContentSettingAdmin)
admin.site.register(ProductSetting, ProductSettingAdmin)
admin.site.register(CurrentSetting, CurrentSettingAdmin)
admin.site.register(Permission, PermissionAdmin)
admin.site.register(ProductRelated, ProductRelatedAdmin)

admin.site.register(Workgroup, WorkgroupAdmin)
admin.site.register(WorkgroupUser, WorkgroupUserAdmin)

admin.site.register(Filterset, FiltersetdAdmin)
admin.site.register(FilterCondition, FilterConditionAdmin)

admin.site.register(BookmarkProduct, BookmarkedAdmin)

from django.contrib import admin

from .models import Product, ProductRelease, ProductTag, File, Table, Catalog, Map, CutOutJob, CutOut, Mask, ProductContent, \
    ProductContentAssociation


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_process_id', 'prd_name',
                    'prd_display_name', 'prd_product_id', 'prd_version', 'prd_description', 'prd_class', 'prd_filter',
                    'prd_flag_removed',)
    list_display_links = ('id', 'prd_process_id', 'prd_name',
                          'prd_display_name', 'prd_product_id', 'prd_version', 'prd_description', 'prd_class',
                          'prd_flag_removed',)
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
        'prd_flag_removed',
    )


class MapAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'mpa_nside', 'mpa_ordering', 'prd_flag_removed',
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('prd_name',)

class CutOutJobAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'cjb_display_name',
    )
    list_display_links = ('id',)
    search_fields = ('cjb_display_name',)

class CutOutAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'ctt_url',
    )
    list_display_links = ('id',)
    search_fields = ('id',)

class MaskAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'prd_flag_removed', 'msk_filter',
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('prd_name',)


class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('pcn_product_id', 'pcn_column_name',)
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)


class ProductContentAssociationAdmin(admin.ModelAdmin):
    list_display = ('pca_product', 'pca_class_content', 'pca_product_content',)
    search_fields = ('pca_product__prd_display_name', 'pca_product__prd_name')


admin.site.register(Product, ProductAdmin)
admin.site.register(ProductRelease, ProductReleaseAdmin)
admin.site.register(ProductTag, ProductTagAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(Table, TableAdmin)
admin.site.register(Catalog, CatalogAdmin)
admin.site.register(Map, MapAdmin)
admin.site.register(CutOutJob, CutOutJobAdmin)
admin.site.register(CutOut, CutOutAdmin)
admin.site.register(Mask, MaskAdmin)
admin.site.register(ProductContent, ProductContentAdmin)
admin.site.register(ProductContentAssociation, ProductContentAssociationAdmin)

from django.contrib import admin

from .models import Product, File, Table, Catalog, Map, Mask, ProductContent, ProductContentAssociation

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id','prd_process_id', 'prd_name',
                    'prd_display_name', 'prd_product_id', 'prd_version', 'prd_description', 'prd_class',
                    'prd_flag_removed',)
    list_display_links = ('id','prd_process_id', 'prd_name',
                          'prd_display_name', 'prd_product_id', 'prd_version', 'prd_description', 'prd_class',
                          'prd_flag_removed',)
    search_fields = ('id', 'prd_process_id', 'prd_name', 'prd_display_name', 'prd_product_id',)

class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_name', 'prd_display_name',
                    'prd_class','fli_base_path','fli_name',)
    list_display_links = ('id', 'prd_name', 'prd_display_name', 'prd_class',)
    search_fields = ('id','fli_name',)

class TableAdmin(admin.ModelAdmin):
    list_display = ('id', 'prd_name', 'prd_display_name',
                    'prd_class','tbl_schema', 'tbl_name',)
    list_display_links = ('id', 'prd_name', 'prd_display_name',
                          'prd_class','tbl_schema', 'tbl_name',)
    search_fields = ('id','tbl_schema','tbl_name',)

class CatalogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'ctl_num_objects',
        'prd_flag_removed',
    )
    # list_display_links = ('pcn_column_name',)
    # search_fields = ('pcn_column_name',)

class MapAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'mpa_nside', 'mpa_ordering', 'prd_flag_removed',
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('id', 'prd_name')

class MaskAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'prd_flag_removed', 'msk_filter', 
    )
    list_display_links = ('id', 'prd_name')
    search_fields = ('id', 'prd_name')

class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('pcn_product_id', 'pcn_column_name',)
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)

class ProductContentAssociationAdmin(admin.ModelAdmin):
    list_display = ('pca_product', 'pca_class_content', 'pca_product_content',)
    search_fields = ('pca_product__prd_display_name', 'pca_product__prd_name')


admin.site.register(Product, ProductAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(Table, TableAdmin)
admin.site.register(Catalog, CatalogAdmin)
admin.site.register(Map, MapAdmin)
admin.site.register(Mask, MaskAdmin)
admin.site.register(ProductContent, ProductContentAdmin)
admin.site.register(ProductContentAssociation, ProductContentAssociationAdmin)

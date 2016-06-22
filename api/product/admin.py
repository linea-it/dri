from django.contrib import admin

# Register your models here.
from .models import Product, Table, Catalog, ProductContent, ProductContentAssociation


class CatalogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'prd_name', 'prd_display_name', 'prd_class', 'ctl_num_columns', 'ctl_num_tiles', 'ctl_num_objects',
        'prd_flag_removed',
    )
    # list_display_links = ('pcn_column_name',)
    # search_fields = ('pcn_column_name',)


class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('pcn_product_id', 'pcn_column_name',)
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)


class ProductContentAssociationAdmin(admin.ModelAdmin):
    list_display = ('pca_product', 'pca_class_content', 'pca_product_content',)
    search_fields = ('pca_product__prd_display_name', 'pca_product__prd_name')


admin.site.register(Product)
admin.site.register(Table)
admin.site.register(Catalog, CatalogAdmin)
admin.site.register(ProductContent, ProductContentAdmin)
admin.site.register(ProductContentAssociation, ProductContentAssociationAdmin)

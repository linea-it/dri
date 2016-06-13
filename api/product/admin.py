from django.contrib import admin

# Register your models here.
from .models import Product, Table, Catalog, ProductContent, ProductContentAssociation

class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('pcn_product_id', 'pcn_column_name',)
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)


class ProductContentAssociationAdmin(admin.ModelAdmin):
    list_display = ('pca_product', 'pca_class_content', 'pca_product_content',)
    search_fields = ('pca_product__prd_display_name', 'pca_product__prd_name')

admin.site.register(Product)
admin.site.register(Table)
admin.site.register(Catalog)
admin.site.register(ProductContent, ProductContentAdmin)
admin.site.register(ProductContentAssociation, ProductContentAssociationAdmin)

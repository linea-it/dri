from django.contrib import admin

# Register your models here.
from .models import Product, Table, Catalog, ProductContent

class ProductContentAdmin(admin.ModelAdmin):
    list_display = ('pcn_product_id', 'pcn_column_name',)
    list_display_links = ('pcn_column_name',)
    search_fields = ('pcn_column_name',)


admin.site.register(Product)
admin.site.register(Table)
admin.site.register(Catalog)
admin.site.register(ProductContent, ProductContentAdmin)

from django.contrib import admin

# Register your models here.
from .models import ProductClass, ProductGroup, ContentCategory, ProductClassContent


class ProductClassContentAdmin(admin.ModelAdmin):
    list_display = ('pcc_name', 'pcc_display_name', 'pcc_category', 'pcc_ucd', 'pcc_unit', 'pcc_reference',
                    'pcc_mandatory', 'pcc_class',)
    list_display_links = ('pcc_name', 'pcc_display_name')
    search_fields = ('pcc_name', 'pcc_display_name')


admin.site.register(ProductGroup)
admin.site.register(ProductClass)
admin.site.register(ProductClassContent, ProductClassContentAdmin)
admin.site.register(ContentCategory)

from django.contrib import admin

from .models import ProductClass, ProductGroup, ContentCategory, ProductClassContent


class ProductGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'pgr_name', 'pgr_display_name', 'is_catalog',)
    list_display_links = ('id', 'pgr_name', 'pgr_display_name', 'is_catalog',)
    search_fields = ('pgr_name', 'pgr_display_name',)


class ProductClassAdmin(admin.ModelAdmin):
    list_display = ('id', 'pcl_name', 'pcl_group', 'pcl_display_name', 'pcl_is_system',)
    list_display_links = ('id', 'pcl_name', 'pcl_group', 'pcl_display_name', 'pcl_is_system',)
    search_fields = ('pcl_name', 'pcl_group__pgr_name', 'pcl_group__pgr_display_name', 'pcl_display_name',)


class ContentCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'cct_name',)
    list_display_links = ('id', 'cct_name',)
    search_fields = ('cct_name',)


class ProductClassContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'pcc_name', 'pcc_display_name', 'pcc_category', 'pcc_ucd', 'pcc_unit', 'pcc_reference',
                    'pcc_mandatory', 'pcc_class',)
    list_display_links = ('pcc_name', 'pcc_display_name')
    search_fields = ('pcc_name', 'pcc_display_name', 'pcc_ucd')


admin.site.register(ProductGroup, ProductGroupAdmin)
admin.site.register(ProductClass, ProductClassAdmin)
admin.site.register(ProductClassContent, ProductClassContentAdmin)
admin.site.register(ContentCategory, ContentCategoryAdmin)

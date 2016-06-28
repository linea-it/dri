from django.contrib import admin

from .models import Export, ExternalProcess

class ExportAdmin(admin.ModelAdmin):
    list_display = ('id', 'exp_username', 'exp_date', 'exp_product_id',
                    'exp_external_process', )
    list_display_links = ('id', 'exp_username', 'exp_date', 'exp_product_id',
                    'exp_external_process', )
    search_field = ('id', 'exp_username', 'exp_product_id', )


class ExternalProcessAdmin(admin.ModelAdmin):
    list_display = ('id', 'epr_site', 'epr_original_id', 'epr_name', 'epr_username', 'epr_start_date', 'epr_end_date',)
    list_display_links = ('id', 'epr_original_id')
    search_fields = ('epr_site', 'epr_original_id', 'epr_name', 'epr_username')

admin.site.register(ExternalProcess, ExternalProcessAdmin)
admin.site.register(Export, ExportAdmin)

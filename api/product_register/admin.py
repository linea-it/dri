from django.contrib import admin

# Register your models here.
from .models import ExternalProcess


class ExternalProcessAdmin(admin.ModelAdmin):
    list_display = ('id', 'epr_site', 'epr_original_id', 'epr_name', 'epr_username', 'epr_start_date', 'epr_end_date',)
    list_display_links = ('id', 'epr_original_id')
    search_fields = ('epr_site', 'epr_original_id', 'epr_name', 'epr_username')


admin.site.register(ExternalProcess, ExternalProcessAdmin)

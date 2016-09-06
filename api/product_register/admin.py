from django.contrib import admin

from .models import Export, ExternalProcess, Site, Authorization


class SiteAdmin(admin.ModelAdmin):
    list_display = ('id', 'sti_user', 'sti_name', 'sti_url', )
    list_display_links = ('id', 'sti_user', 'sti_name', 'sti_url', )
    search_field = ('id', 'sti_user', 'sti_name')


class ExportAdmin(admin.ModelAdmin):
    list_display = ('id', 'exp_username', 'exp_date',
                    'exp_external_process', )
    list_display_links = ('id', 'exp_username', 'exp_date',
                    'exp_external_process', )
    search_field = ('id', 'exp_username', )


class ExternalProcessAdmin(admin.ModelAdmin):
    list_display = ('id', 'epr_site', 'epr_original_id', 'epr_name', 'epr_username', 'epr_start_date', 'epr_end_date',)
    list_display_links = ('id', 'epr_original_id')
    search_fields = ('epr_site', 'epr_original_id', 'epr_name', 'epr_username')


class AuthorizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'ath_ticket', 'ath_date',)
    search_fields = ('ath_ticket',)


admin.site.register(Site, SiteAdmin)
admin.site.register(ExternalProcess, ExternalProcessAdmin)
admin.site.register(Export, ExportAdmin)
admin.site.register(Authorization, AuthorizationAdmin)

from django.contrib import admin

from .models import Export, ExternalProcess, ProcessRelease, Site, Authorization


class SiteAdmin(admin.ModelAdmin):
    list_display = ('id', 'sti_user', 'sti_name', 'sti_url',)
    list_display_links = ('id', 'sti_user', 'sti_name', 'sti_url',)
    search_field = ('sti_user', 'sti_name')


class ExportAdmin(admin.ModelAdmin):
    list_display = ('id', 'exp_username', 'exp_date',)
    list_display_links = ('id', 'exp_username', 'exp_date',)
    search_field = ('exp_username',)


class ExternalProcessAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'epr_site', 'epr_original_id', 'epr_name', 'epr_owner', 'epr_username', 'epr_start_date', 'epr_end_date',)
    list_display_links = ('id', 'epr_original_id')
    search_fields = ('epr_site', 'epr_original_id', 'epr_name', 'epr_username')


class ProcessReleaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'process', 'release',)
    list_display_links = ('id', 'process', 'release',)
    search_fields = ('process', 'release',)


class AuthorizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'ath_ticket', 'ath_date',)
    search_fields = ('ath_ticket',)


admin.site.register(Site, SiteAdmin)
admin.site.register(ExternalProcess, ExternalProcessAdmin)
admin.site.register(ProcessRelease, ProcessReleaseAdmin)
admin.site.register(Export, ExportAdmin)
admin.site.register(Authorization, AuthorizationAdmin)

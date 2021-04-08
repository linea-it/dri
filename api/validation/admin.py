from django.contrib import admin

from .models import Feature, Flagged, Defect, Inspect


class FeatureAdmin(admin.ModelAdmin):
    list_display = ('id', 'ftr_name',)
    list_display_links = ('id', 'ftr_name',)
    search_fields = ('id', 'ftr_name',)


class FlaggedAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'flg_dataset', 'flg_flagged',)
    list_display_links = ('id', 'owner', 'flg_dataset', 'flg_flagged',)
    search_fields = ('id', 'owner', 'flg_flagged',)


class InspectAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'isp_dataset', 'isp_value',)
    list_display_links = ('id', 'owner', 'isp_dataset', 'isp_value',)
    search_fields = ('id', 'owner', 'isp_dataset',)


class DefectAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'dfc_dataset',
                    'dfc_filter', 'dfc_feature', 'dfc_ra', 'dfc_dec',)
    list_display_links = ('id', 'owner', 'dfc_dataset',
                          'dfc_filter', 'dfc_feature', 'dfc_ra', 'dfc_dec',)
    search_fields = ('id', 'owner',)


admin.site.register(Feature, FeatureAdmin)
admin.site.register(Flagged, FlaggedAdmin)
admin.site.register(Inspect, InspectAdmin)
admin.site.register(Defect, DefectAdmin)

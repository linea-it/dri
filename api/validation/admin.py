from django.contrib import admin

from .models import Feature, Flagged, Defect, UserEmail


class FeatureAdmin(admin.ModelAdmin):
    list_display = ('id', 'ftr_name',)
    list_display_links = ('id', 'ftr_name',)
    search_fields = ('id', 'ftr_name',)


class FlaggedAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'flg_dataset', 'flg_flagged',)
    list_display_links = ('id', 'owner', 'flg_dataset', 'flg_flagged',)
    search_fields = ('id', 'owner', 'flg_flagged',)


class DefectAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'dfc_dataset',
                    'dfc_filter', 'dfc_feature', 'dfc_ra', 'dfc_dec',)
    list_display_links = ('id', 'owner', 'dfc_dataset',
                          'dfc_filter', 'dfc_feature', 'dfc_ra', 'dfc_dec',)
    search_fields = ('id', 'owner',)

class UserEmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'email',)
    list_display_links = ('id', 'email',)
    search_fields = ('id', 'email',)


admin.site.register(Feature, FeatureAdmin)
admin.site.register(Flagged, FlaggedAdmin)
admin.site.register(Defect, DefectAdmin)
admin.site.register(UserEmail, UserEmailAdmin)

from django.contrib import admin

from .models import Position, Dataset


class PositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'pst_dataset', 'pst_ra',
                    'pst_dec', 'pst_date', 'pst_comment',)

    search_fields = ('id', 'pst_ra', 'pst_dec', 'pst_comment',)


admin.site.register(Position, PositionAdmin)

class DatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'dts_dataset', 'dts_date',
                    'dts_comment',)

    search_fields = ('id', 'dts_comment',)

admin.site.register(Dataset, DatasetAdmin)


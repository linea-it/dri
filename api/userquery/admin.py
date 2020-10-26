from django.contrib import admin
from .models import *


class QueryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'release', 'creation_date', 'is_sample', 'is_public', 'description')
    list_display_links = ('id', 'name',)
    search_fields = ('name',)


class JobAdmin(admin.ModelAdmin):
    list_display = ('id', 'display_name', 'owner', 'job_status', 'start_date_time', 'end_date_time', 'query_name', 'job_id')
    list_display_links = ('id', 'display_name',)
    search_fields = ('display_name',)


class TableAdmin(admin.ModelAdmin):
    list_display = ('id', 'table_name', 'display_name', 'owner', 'release', 'tbl_num_objects', 'product', )
    list_display_links = ('id', 'display_name',)
    search_fields = ('display_name',)


admin.site.register(Query, QueryAdmin)
admin.site.register(Job, JobAdmin)
admin.site.register(Table, TableAdmin)

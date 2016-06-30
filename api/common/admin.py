from django.contrib import admin

from .models import Filter

class FilterAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'filter', 'lambda_min', 'lambda_max',
                    'lambda_mean',)
    list_display_links = ('id', 'project', 'filter', 'lambda_min', 'lambda_max',
                    'lambda_mean',)
    search_fields = ('id','project','filter',)

admin.site.register(Filter, FilterAdmin)

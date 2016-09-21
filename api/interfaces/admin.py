from django.contrib import admin

from .models import Application 

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id','app_name', 'app_display_name', 'app_url', 'app_disabled')
    list_display_links = ('id','app_name', 'app_display_name', 'app_url',)
    search_fields = ('id', 'app_name', 'app_display_name')

admin.site.register(Application, ApplicationAdmin)

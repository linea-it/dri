from django.contrib import admin

from .models import Application 

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id','app_name', 'app_url','app_short_description','app_long_description',)
    list_display_links = ('id','app_name', 'app_url','app_short_description','app_long_description',)
    search_fields = ('id','app_name',)

admin.site.register(Application, ApplicationAdmin)

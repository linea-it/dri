from django.contrib import admin

from .models import Application, Tutorial

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id','app_name', 'app_display_name', 'app_url', 'app_disabled')
    list_display_links = ('id','app_name', 'app_display_name', 'app_url',)
    search_fields = ('id', 'app_name', 'app_display_name')

class TutorialsAdmin(admin.ModelAdmin):
    list_display = ('id','application', 'ttr_title', 'ttr_src', 'ttr_description',)
    list_display_links = ('id','ttr_title', 'ttr_src', 'ttr_description',)
    search_fields = ('id', 'application__app_name', 'ttr_title')

admin.site.register(Application, ApplicationAdmin)
admin.site.register(Tutorial, TutorialsAdmin)


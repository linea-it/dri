from django.contrib import admin

from .models import Activity
from .models import Visit


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('owner', 'event', 'date',)
    list_display_links = ('owner', 'event', 'date',)
    search_fields = ['owner__username', 'event', 'date']

admin.site.register(Activity, ActivityAdmin)


class VisitAdmin(admin.ModelAdmin):
    list_display = ('owner', 'date',)
    list_display_links = ('owner', 'date',)
    search_fields = ['owner__username', 'date']

admin.site.register(Visit, VisitAdmin)
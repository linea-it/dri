from django.contrib import admin

from .models import Activity


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('owner', 'event', 'date',)
    list_display_links = ('owner', 'event', 'date',)
    search_fields = ['owner__username', 'event', 'date']

admin.site.register(Activity, ActivityAdmin)

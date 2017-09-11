from django.contrib import admin

from .models import Statistics


class StatisticsAdmin(admin.ModelAdmin):
    list_display = ('owner', 'event', 'date',)
    list_display_links = ('owner', 'event', 'date',)
    search_fields = ['owner__username', 'event', 'date']

admin.site.register(Statistics, StatisticsAdmin)

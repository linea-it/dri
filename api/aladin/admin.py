from django.contrib import admin
from .models import Image


class ImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'img_url', 'product']
    search_fields = ['id', 'img_url', 'product']

admin.site.register(Image, ImageAdmin)

from django.contrib import admin

# Register your models here.
from .models import Release
from .models import Tile
from .models import Tag

admin.site.register(Release)
admin.site.register(Tile)
admin.site.register(Tag)
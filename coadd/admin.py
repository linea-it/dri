from django.contrib import admin

# Register your models here.
from .models import Release
from .models import Tile
from .models import Tag
from .models import Tag_Tile

admin.site.register(Release)
admin.site.register(Tile)
admin.site.register(Tag)
admin.site.register(Tag_Tile)
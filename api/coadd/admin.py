from django.contrib import admin

# Register your models here.
from .models import Release
from .models import Tile
from .models import Tag
from .models import Dataset 
from .models import Filter
from .models import Survey

admin.site.register(Release)
admin.site.register(Tile)
admin.site.register(Tag)
admin.site.register(Dataset)
admin.site.register(Filter)
admin.site.register(Survey)

from django.contrib import admin

# Register your models here.
from .models import Feature 
from .models import Flagged
from .models import Defect

admin.site.register(Feature)
admin.site.register(Flagged)
admin.site.register(Defect)

from django.contrib import admin

# Register your models here.
from .models import ProductClass, ProductGroup

admin.site.register(ProductClass)
admin.site.register(ProductGroup)

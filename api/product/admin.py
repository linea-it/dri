from django.contrib import admin

# Register your models here.
from .models import Product, Table, Catalog

admin.site.register(Product)
admin.site.register(Table)
admin.site.register(Catalog)

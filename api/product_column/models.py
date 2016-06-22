from product.models import Product

from django.db import models


class Column(models.Model):
    clm_product_id = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    clm_column_name = models.CharField(
        max_length=256, verbose_name='Column Name')

    def __str__(self):
        return self.clm_column_name

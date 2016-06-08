from product.models import Product

from django.db import models


class ProductColumn(models.Model):
    pcl_product_id = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    pcl_column_name = models.CharField(
        max_length=256, verbose_name='Column Name')

    def __str__(self):
        return self.pcl_column_name

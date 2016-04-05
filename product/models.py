from django.db import models
import logging
from product_classifier.models import ProductClass

logger = logging.getLogger(__name__)


# Create your models here.
class Product(models.Model):

    prd_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    prd_display_name = models.CharField(
        max_length=128, verbose_name='Display Name')
    prd_class = models.ForeignKey(ProductClass, on_delete=models.CASCADE)
    prd_flag_removed = models.BooleanField(
        default=False, verbose_name='Mark a product as removed')

    def __str__(self):
        return self.prd_display_name

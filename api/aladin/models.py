from django.db import models
from product.models import Product


class Image(models.Model):
    img_url = models.URLField(
        verbose_name='URL',
        help_text=('Full URL to the path, including host name. '
                   'Example: 	http://{host}/data/releases/{release_name}/images/aladin/{band}')
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')

    def __str__(self):
        return self.product.prd_display_name + ' (' + self.img_url + ')'

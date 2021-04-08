from django.apps import AppConfig


class ProductConfig(AppConfig):
    name = 'product'
    verbose_name = ('product')

    def ready(self):
        import product.signals

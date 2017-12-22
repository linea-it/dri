import logging
from django.conf import settings
from .models import Product
from datetime import datetime, timedelta
from django.db.models import Q


class GarbageColectorProduct:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger()

    def purge_products_expiration_time(self):

        print("Remover todos os produtos que tem mais tempo do que o limit")

        try:
            expiration_time = settings.PRODUCT_EXPIRATION_TIME

            print("Expiration Time: %s h" % expiration_time)

        except Exception as e:
            raise Exception("The PRODUCT_EXPIRATION_TIME variable is not configured in settings.")

        today = datetime.today()
        print("Today: %s" % today)

        date_expired = today - timedelta(hours=expiration_time)
        print("Expired: %s" % date_expired)

        print("Todos os Produtos: %s" % Product.objects.all().count())

        # recuperar todos os produtos que foram criados a mais tempo que o expiration_time
        # e que nao estejam marcados como permanente
        products = Product.objects.filter(
            Q(Q(prd_date__lt=date_expired) |
              Q(prd_date__isnull=True)),
            prd_is_permanent=False,
            table__tbl_name__isnull=False
        )

        print("Produtos a Serem removidos: %s" % products.count())

        for product in products:
            print("Removendo produto: ID[%s] NAME[%s]" % (product.pk, product.prd_name))
            try:

                product.delete()
                print("Produto removido")

            except Exception as e:
                print(e)
                print("falha ao remover produto")

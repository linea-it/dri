import logging
from django.conf import settings
from .models import Product
from datetime import datetime, timedelta
from django.db.models import Q


class GarbageColectorProduct:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger("garbage_colector")

    def purge_products_expiration_time(self):
        try:
            expiration_time = settings.PRODUCT_EXPIRATION_TIME

            self.logger.info("Expiration Time: %s h" % expiration_time)

        except Exception as e:
            raise Exception("The PRODUCT_EXPIRATION_TIME variable is not configured in settings.")

        if expiration_time is not None:

            self.logger.info("---------------------------------------------------------")

            self.logger.info("Remove all products that have time greater than the limit")

            today = datetime.today()
            date_expired = today - timedelta(hours=expiration_time)

            self.logger.info("Expired: %s" % date_expired)

            self.logger.info("Total Products: %s" % Product.objects.all().count())

            # recuperar todos os produtos que foram criados a mais tempo que o expiration_time
            # e que nao estejam marcados como permanente
            products = Product.objects.filter(
                Q(Q(prd_date__lt=date_expired) |
                  Q(prd_date__isnull=True)),
                prd_is_permanent=False,
                table__tbl_name__isnull=False
            )

            self.logger.info("Products to be removed: %s" % products.count())

            for product in products:
                self.logger.info("Removing product: ID[%s] NAME[%s]" % (product.pk, product.prd_name))
                try:

                    product.delete()
                    self.logger.info("Removed: ID[%s]" % product.pk)

                except Exception as e:
                    self.logger.warning(e)


from __future__ import absolute_import, unicode_literals

from celery import shared_task

# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Garbage Colector %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@shared_task()
def garbage_collector():
    """
    Executa rotinas de limpesa
    """
    # Limpar os produtos
    from product.garbagecolector import GarbageColectorProduct
    GarbageColectorProduct().purge_products_expiration_time()

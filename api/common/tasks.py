from __future__ import absolute_import, unicode_literals

from celery import task
from celery.decorators import periodic_task
from celery.task.schedules import crontab

from django.conf import settings
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Garbage Colector %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% #
@periodic_task(
    run_every=(crontab(minute='*/10')),
    #run_every=10.0,
    name="garbage_colector",
    ignore_result=True
)
def garbage_colector():
    """
    Executa rotinas de limpesa
    """
    # Limpar os produtos
    from product.garbagecolector import GarbageColectorProduct
    GarbageColectorProduct().purge_products_expiration_time()

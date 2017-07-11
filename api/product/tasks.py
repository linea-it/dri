from __future__ import absolute_import, unicode_literals
from celery import task
from product.descutoutservice import DesCutoutService

@task(name="test_task")
def test_task(x, y):
    return x + y

@task(name="start_des_cutout_job_by_id")
def start_des_cutout_job_by_id(id):
    """
        Esta Task vai instanciar a Classe DesCutoutService,
        executar o methodo start_job_by_id
        esse job vai enviar o job para o servico do des.

        :param id: Chave pk do model product.CutOutModel
    """
    print("start_des_cutout_job_by_id(%s)" % id)
    DesCutoutService().start_job_by_id(int(id))

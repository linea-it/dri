from __future__ import absolute_import, unicode_literals
from celery import task
from product.descutoutservice import DesCutoutService

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


def check_jobs_running():
    """
        Recupera todos os cutoutjobs com status Running
        e verifica no servico DESCutout o status do job
        e os marca com status
    """
    DesCutoutService().check_jobs()
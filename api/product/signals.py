from django.db.models.signals import post_save
from django.dispatch import receiver
from product.models import CutOutJob
from product.tasks import start_des_cutout_job_by_id
from product.tasks import download_cutoutjob

@receiver(post_save, sender=CutOutJob)
def start_des_cutout_job(sender, instance, created, **kwargs):
    """
        Toda vez que um model CutOutJob for criado sera disparado um job para o servico DESCutout
        Utilizando uma Task com Cellery
    """
    if created:
        start_des_cutout_job_by_id.delay(instance.pk)

    else:
        # Se e um update da um cutoutjob e o status e Before Download
        if instance.cjb_status == 'bd':
            # Disparar a task que vai fazer o downaload
            download_cutoutjob.delay(instance.pk)

        elif instance.cjb_status == 'je':
            # TODO avisar o usuario que o job deu erro no lado da API.
            pass

        elif instance.cjb_status == 'er':
            # TODO avisar o usuario que o job deu erro e talvez abrir um tickect.
            pass

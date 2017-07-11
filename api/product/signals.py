from django.db.models.signals import post_save
from django.dispatch import receiver
from product.models import CutOutJob
from product.tasks import start_des_cutout_job_by_id

@receiver(post_save, sender=CutOutJob)
def start_des_cutout_job(sender, instance, created, **kwargs):
    """
        Toda vez que um model CutOutJob for criado sera disparado um job para o servico DESCutout
        Utilizando uma Task com Cellery
    """
    # if created:
    start_des_cutout_job_by_id.delay(instance.pk)


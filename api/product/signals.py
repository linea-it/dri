from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from product.models import CutOutJob, Product
from product.tasks import start_des_cutout_job_by_id
from product.tasks import download_cutoutjob
from product.tasks import purge_cutoutjob_dir
from product.tasks import notify_user_by_email
from lib.sqlalchemy_wrapper import DBBase


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

        elif instance.cjb_status == 'dl':
            # Quando um Model Cutout Job for marcado como deletado
            purge_cutoutjob_dir.delay(instance.pk)

        elif instance.cjb_status == 'ok':
            notify_user_by_email.delay(instance.pk)

        elif instance.cjb_status == 'je':
            notify_user_by_email.delay(instance.pk)

        elif instance.cjb_status == 'er':
            notify_user_by_email.delay(instance.pk)


@receiver(post_delete, sender=CutOutJob)
def purge_cutout_job_dir(sender, instance, using, **kwargs):
    """
    Toda Vez que um CutoutJob for deletado deve remover o diretorio com as imagens

    """
    purge_cutoutjob_dir.delay(instance.pk, instance.cjb_product.pk)


@receiver(pre_delete, sender=Product)
def drop_product_table(sender, instance, using, **kwargs):
    """
    Toda vez que um produto for deletado a tabela no banco de catalogos deve ser removida.
    https://docs.djangoproject.com/en/2.0/ref/signals/#pre-delete
    :param sender:
    :param instance:
    :param using:
    :return:
    """
    if instance.prd_is_permanent:
        raise Exception(
            "This product is permanent and can not be removed, to remove change the value of the is_permanent flag to false.")

    else:

        # Se o produto nao tiver nome de tabela nao faz nada.
        if not instance.table.tbl_name:
            return

        try:
            # So permitir deletar tabelas no banco de catalogo.
            db = DBBase('catalog')

            # Checar se a tabela existe e so tentar fazer o drop se existir
            if (db.table_exists(instance.table.tbl_name,
                                schema=instance.table.tbl_schema)):
                db.drop_table(
                    instance.table.tbl_name,
                    schema=instance.table.tbl_schema)

        except Exception as e:
            # Tenta dropar a tabela se nao conseguir nao faz nada.
            pass

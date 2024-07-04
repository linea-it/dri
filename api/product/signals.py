from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from product.models import CutOutJob, Product
from lib.sqlalchemy_wrapper import DBBase

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

        # So permitir deletar tabelas no banco de catalogo.
        if instance.table.tbl_database == 'catalog':
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


# post_save.connect(start_des_cutout_job, sender=CutOutJob)
# pre_delete.connect(drop_product_table, sender=Product)

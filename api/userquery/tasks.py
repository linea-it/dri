from __future__ import absolute_import, unicode_literals
from celery import shared_task

from django.contrib.auth.models import User
from .models import Table
from .create_table_as import CreateTableAs

from product.export import Export


export = Export()


@shared_task(name="create_table")
def create_table(job_id, user_id, table_name, release_id,
                 associate_target_viewer, schema=None):
    create_table_as = CreateTableAs(job_id, user_id, table_name, release_id,
                                    associate_target_viewer, schema=schema)
    logger = create_table_as.logger

    logger.info("Task create_table_as has started")
    create_table_as.do_all()


@shared_task(name="export_table")
def export_table(table_id, user_id, columns=None):
    """
    Este metodo vai exportar uma tabela para o formato csv
    """

    logger = export.logger

    logger.info("Starting Export Task for the table %s" % table_id)
    # logger.debug("User: %s" % user_id)

    try:
        table = Table.objects.get(pk=table_id)
    except Table.DoesNotExist as e:
        logger.error("Table matching does not exist. Table Id: %s" % table_id)
        # TODO enviar email de error

    user = User.objects.get(pk=int(user_id))

    try:
        #revire function --->
        export.notify_user_export_start(user, table.display_name)

        # Criar o diretorio de export
        export_dir = export.create_export_dir(name=table.table_name)

        export.table_to_csv() ######


        # Cutouts
        if cutoutjob_id not in [None, "", False, "false", "False", 0]:
            header.append(
                export_cutoutjob.s(
                    cutoutjob_id,
                    export_dir))

        callback = export_create_zip.s(user.pk, product.prd_display_name, export_dir)

        result = chord(header)(callback)

        result.get()

    except Exception as e:
        logger.error(e)

        # TODO: Deveria notificar o usuario em caso de falha mais o Celery esta retornando uma exception que nao
        # consegui corrigir Never call result.get() within a task!
        # See http://docs.celeryq.org/en/latest/userguide/tasks.html#task-synchronous-subtasks
        # A solucao provavel e mudar a estrutura de tasks ao inves de usar chord utilizar tasks normais
        # encadeadas e um callback no final.

        # export_notify_user_failure(user, product)

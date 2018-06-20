from __future__ import absolute_import, unicode_literals
from celery import shared_task, task, app
from celery import chord

from django.contrib.auth.models import User
from .models import Table
from .create_table_as import CreateTableAs
from .email import Email

from product.export import Export

export = Export()

@task(bind=True)
def create_table(self, job_id, user_id, table_name, table_display_name, release_id, release_name, associate_target_viewer, schema=None):
    # instance, not create table in database
    create_table_as = CreateTableAs(
        job_id=job_id, 
        user_id=user_id, 
        table_name=table_name, 
        table_display_name=table_display_name,
        release_id=release_id,  
        release_name=release_name,
        associate_target_viewer=associate_target_viewer, 
        task_id=self.request.id,
        schema=schema
    )

    logger = create_table_as.logger

    logger.info("Task create_table_as has started\n")

    # start teble creation process
    create_table_as.do_all()

@task(name="export_table", bind=True)
def export_table(self, table_id, user_id, columns=None, job_id=None):
    """
    Este metodo vai exportar uma tabela para o formato csv
    """

    job_id = self.request.id
    logger = export.logger

    logger.info("Starting Export Task for the table id=%s" % table_id)

    try:
        table = Table.objects.get(pk=int(table_id))
    except Table.DoesNotExist as e:
        logger.error("Table matching does not exist. Table Id: %s" % table_id)

    user = User.objects.get(pk=int(user_id))
    
    try:
        Email().send({
            "email": user.email,
            "template": "download_notification_start.html",
            "subject": "The process of your download is being processed",
            "username": user.username,
            "id_job": job_id,
            "table_display_name": table.display_name
        })
        
        export_dir = export.create_export_dir(name=table.table_name)
        export.table_to_csv(table=table.table_name, schema=table.schema, export_dir=export_dir, columns=columns)

        url = export.create_zip(export_dir)
        Email().send({
            "email": user.email,
            "template": "download_notification_finish.html",
            "subject": "The process of your download is finished",
            "username": user.username,
            "url": url,
            "id_job": job_id,
            "table_display_name": table.display_name
        })

    except Exception as e:
        logger.error(e)

        # TODO: Deveria notificar o usuario em caso de falha mais o Celery esta retornando uma exception que nao
        # consegui corrigir Never call result.get() within a task!
        # See http://docs.celeryq.org/en/latest/userguide/tasks.html#task-synchronous-subtasks
        # A solucao provavel e mudar a estrutura de tasks ao inves de usar chord utilizar tasks normais
        # encadeadas e um callback no final.

        # export_notify_user_failure(user, product)

@task(name="export_create_zip")
def export_create_zip(self, user_id, product_name, export_dir):
    """
    Cria um arquivo zip com todos os arquivos gerados pelo export.
    """
    url = export.create_zip(export_dir)

    export.notify_user_export_success(user_id, product_name, url)

from __future__ import absolute_import, unicode_literals
from celery import shared_task

from .create_table_as import CreateTableAs


@shared_task(name="create_table")
def create_table(job_id, user_id, table_name, associate_target_viewer, schema=None, timeout=None):
    create_table_as = CreateTableAs(job_id, user_id, table_name, associate_target_viewer, schema=schema, timeout=timeout)
    logger = create_table_as.logger

    logger.info("Task create_table_as has started")
    create_table_as.do_all()

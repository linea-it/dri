from __future__ import absolute_import, unicode_literals
from celery import shared_task

from .create_table_as import CreateTableAs


create_table_as = CreateTableAs()


@shared_task(name="create_table")
def create_table(job_id, user_id, table_name, schema=None, timeout=None):
    logger = create_table_as.logger

    logger.info("Task create_table_as has started")
    create_table_as.create_table_by_job_id(job_id, user_id, table_name, schema=schema, timeout=timeout)


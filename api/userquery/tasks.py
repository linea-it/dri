from __future__ import absolute_import, unicode_literals
from celery import shared_task

from .create_table_as import CreateTableAs


@shared_task(name="create_table")
def create_table(job_id, user_id, table_name, release_id,
                 associate_target_viewer, schema=None):
    create_table_as = CreateTableAs(job_id, user_id, table_name, release_id,
                                    associate_target_viewer, schema=schema)
    logger = create_table_as.logger

    logger.info("Task create_table_as has started")
    create_table_as.do_all()

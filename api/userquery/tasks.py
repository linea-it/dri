# Create your tasks here
from __future__ import absolute_import, unicode_literals
from celery import shared_task
from lib.sqlalchemy_wrapper import DBBase


@shared_task(name="create_table")
def create_table(table, sql, schema=None, timeout=None):
    db = DBBase('userquery')
    db.create_table_raw_sql(table, sql, schema=None, timeout=timeout)


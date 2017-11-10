# Create your tasks here
from __future__ import absolute_import, unicode_literals
from django.utils import timezone
from celery import shared_task
from lib.sqlalchemy_wrapper import DBBase

from userquery.models import Job


@shared_task(name="create_table")
def create_table(table, sql, id, schema=None, timeout=None):

    db = DBBase('userquery')
    q = Job.objects.get(pk=id)
    q.job_status = 'rn'
    q.save()
    try:
        db.create_table_raw_sql(table, sql, schema=schema, timeout=timeout)
        q.job_status = 'ok'
    except:
        q.job_status = 'er'
    q.end_date_time = timezone.now()
    q.save()

# from http://docs.celeryproject.org/en/latest/django
#      /first-steps-with-django.html#using-celery-with-django

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dri.settings")

app = Celery('dri')

# Using a string here means the worker don't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
# app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.update(settings.CELERY)

# https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
app.conf.beat_schedule = {
    "garbage-collector-30-minutes": {
        "task": "common.tasks.garbage_collector",
        "schedule": crontab(minute="*/30"),
    },
    "statistics-by-day-daily-at-midnight": {
        "task": "common.tasks.activity_statistic_accesses_by_day",
        "schedule": crontab(minute=0, hour=0),
    },
    "statistics-email-daily-at-8am": {
        "task": "common.tasks.activity_statistic_email_unique_hits_per_day",
        "schedule": crontab(minute=0, hour=8),
    },
}
app.conf.timezone = "UTC"

app.autodiscover_tasks()


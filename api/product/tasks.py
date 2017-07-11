from __future__ import absolute_import, unicode_literals
from celery import task

@task(name="test_task")
def test_task(x, y):
    return x + y

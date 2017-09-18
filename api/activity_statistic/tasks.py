from __future__ import absolute_import, unicode_literals

from celery import task
from celery.decorators import periodic_task
from celery.task.schedules import crontab


@periodic_task(
    run_every=(crontab(minute='*/1')),
    # run_every=(crontab(minute='*/%s' % descutout.check_jobs_task_delay)),
    # run_every=10.0,
    name="activity_statistic_accesses_by_day",
    ignore_result=True
)
def activity_statistic_accesses_by_day():
    """

    """
    print("----------- TESTE ----------------")

    from activity_statistic.reports import ActivityReports
    ActivityReports().report_email_unique_visits_today()


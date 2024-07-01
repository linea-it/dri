from __future__ import absolute_import, unicode_literals

from celery import task
from celery.decorators import periodic_task
from celery.task.schedules import crontab
from celery import shared_task

@shared_task()
def activity_statistic_accesses_by_day():
    """
        Varre a tabela de acessos para recuperar os
        acessos unicos, e guarda em uma tabela separada.
        Essa task apenas coleta as informacoes.
        Executada todo dias as 23:50
    """
    from activity_statistic.reports import ActivityReports
    ActivityReports().unique_visits_today()


@shared_task()
def activity_statistic_email_unique_hits_per_day():
    """
        Envia o Email de Acessos unicos referente ao dia anterior
    """

    from activity_statistic.reports import ActivityReports
    import datetime

    yesterday = datetime.date.today() - datetime.timedelta(days=1)

    ActivityReports().report_email_unique_visits(yesterday)

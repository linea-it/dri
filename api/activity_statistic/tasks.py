from __future__ import absolute_import, unicode_literals

from celery import task

@task(name="test")
def test():
    """

    """
    print("----------- TESTE ----------------")
    from activity_statistic.general_statistic import GeneralStatistic

    from activity_statistic.models import Activity

    print(GeneralStatistic().visits_and_recent_login())

    print(Activity.objects.count())
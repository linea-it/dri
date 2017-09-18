from .models import Activity
from .models import Visit
from datetime import datetime, date
from django.db.models import Count


class ActivityReports:
    def __init__(self):
        pass

    def unique_visits_by_date(self, year, month, day):
        users = list()
        uniqueVisits = list()
        activities = Activity.objects.filter(
            date__year=year,
            date__month=month,
            date__day=day).order_by('-date')

        for activity in activities:

            if activity.owner.pk not in users:
                users.append(activity.owner.pk)

                # Recuperar a visita
                visit = self.get_or_create_unique_visit(activity)

        # Recuperar os usuarios que visitaram neste dia + o total de visitas dele no mes
        visits_count = Visit.objects.filter(
            date__year=year,
            date__month=month,
            owner__pk__in=users).annotate(visits_in_month=Count('owner'))

        for a in visits_count:
            uniqueVisits.append(dict({
                "user": a.owner.username,
                "last_activity": a.date.strftime('%Y-%m-%d %H:%M'),
                "visits_in_month": a.visits_in_month
            }))

        return uniqueVisits

    def unique_visits_today(self):
        today = date.today()

        return self.unique_visits_by_date(today.year, today.month, today.day)

    def get_or_create_unique_visit(self, activity):
        """
            Verifica se o ja existe uma registro de visita para
            este usuario neste dia, se nao existir cria um entrada na tabela Visit

        :param self:
        :param activity:
        :return: Model Visit
        """
        try:
            visit, created = Visit.objects.get_or_create(
                owner=activity.owner,
                date__year=activity.date.year,
                date__month=activity.date.month,
                date__day=activity.date.day)

            # se ja existir atualiza o date time para manter o registro mais recente
            if not created:
                visit.date = activity.date
                visit.save()

            print("Visit: %s  %s" % (visit.pk, created))

            return visit

        except VisitMultipleObjectsReturned as e:
            # A tabela de visitas unicas por dia so pode ter uma entrada do mesmo
            # usuario no mesmo dia.
            raise e


    # TODO Codigo gerado pelo Felipe, que precisa ser alterado para o novo app.
    # def visits_and_recent_login(self):
    #     users = User.objects.all()
    #     results = []
    #     for user in users:
    #         statistics = Statistics.objects.filter(owner=user).order_by('-date')
    #         if len(statistics) != 0:
    #             results.append(dict({
    #                 "user": user.email,
    #                 "visits": len(statistics),
    #                 "last_visit": str(statistics[0].date.date())
    #             }))
    #     return results
    #
    # def total_visits(self):
    #     users = User.objects.all()
    #     visits = []
    #     for user in users:
    #         statistics = Statistics.objects.filter(owner=user).order_by('-date')
    #         if len(statistics) != 0:
    #             visits.append(dict({
    #                 "user": user.email,
    #                 "visits": len(statistics),
    #             }))
    #
    #     sorted_list = sorted(visits, key=lambda k: k['visits'])
    #     number_of_visits = 0
    #     result = dict()
    #     result[str(number_of_visits) + '-' + str(number_of_visits + 4)] = 0
    #     for visit in sorted_list:
    #         if visit['visits'] <= number_of_visits + 4:
    #             result[str(number_of_visits) + '-' + str(number_of_visits + 4)] += 1
    #         else:
    #             number_of_visits += 4
    #             result[str(number_of_visits) + '-' + str(number_of_visits + 4)] = 1
    #     total_visits = len(Statistics.objects.all())
    #     return {"Total of users grouped by number of visits": result, "Total Visits": total_visits}
    #
    # def visits_per_month(self):
    #     results = dict()
    #     statistics = Statistics.objects.all().order_by('-date')
    #     for statistic in statistics:
    #         if statistic.date.strftime("%Y-%m") not in results.keys():
    #             results[statistic.date.strftime("%Y-%m")] = 1
    #         else:
    #             results[statistic.date.strftime("%Y-%m")] += 1
    #     return {"Visits Per Month": results}
from django.contrib.auth.models import User
from statistics.models import *
from statistics.serializers import *

class GeneralStatistics:
    def visits_and_recent_login():
        users = User.objects.all()
        results = []
        for user in users:
            statistics = Statistics.objects.filter(owner=user).order_by('-date')
            if len(statistics) != 0:
                results.append(dict({
                    "user": user.email,
                    "visits": len(statistics),
                    "last_visit": str(statistics[0].date.date())
                }))
        return results

    def total_visits():
        users = User.objects.all()
        visits = []
        for user in users:
            statistics = Statistics.objects.filter(owner=user).order_by('-date')
            if len(statistics) != 0:
                visits.append(dict({
                    "user": user.email,
                    "visits": len(statistics),
                }))

        sorted_list = sorted(visits, key=lambda k: k['visits'])
        number_of_visits = 0
        result = dict()
        result[str(number_of_visits) + '-' + str(number_of_visits+4)] = 0
        for visit in sorted_list:
            if visit['visits'] <= number_of_visits+4:
                result[str(number_of_visits) + '-' + str(number_of_visits+4)] += 1
            else:
                number_of_visits += 4
                result[str(number_of_visits) + '-' + str(number_of_visits+4)] = 1
        total_visits = len(Statistics.objects.all())
        return {"Total of users grouped by number of visits": result, "Total Visits": total_visits}

    def visits_per_month():
        results = dict()
        statistics = Statistics.objects.all().order_by('-date')
        for statistic in statistics:
            if statistic.date.strftime("%Y-%m") not in results.keys():
                results[statistic.date.strftime("%Y-%m")] = 1
            else:
                results[statistic.date.strftime("%Y-%m")] += 1
        return {"Visits Per Month": results}

from .models import Activity
from datetime import datetime, date

class ActivityReports:
    def __init__(self):
        pass

    def visits_and_recent_login(self):
        print('ActivityReports::visits_and_recent_login')
        return 10

    def unique_visits_by_date(self, year, month, day):
        users = list()
        visits = list()
        activities = Activity.objects.filter(
            date__year=year,
            date__month=month,
            date__day=day).order_by('-date')

        for activity in activities:
            if activity.owner.pk not in users:
                users.append(activity.owner.pk)

                visits.append(dict({
                    "user": activity.owner.username,
                    "last_activity": activity.date.strftime('%Y-%m-%d %H:%M')
                }))


        return visits


    def unique_visits_today(self):
        today = date.today()

        return self.unique_visits_by_date(today.year, today.month, today.day)


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
    #     result[str(number_of_visits) + '-' + str(number_of_visits+4)] = 0
    #     for visit in sorted_list:
    #         if visit['visits'] <= number_of_visits+4:
    #             result[str(number_of_visits) + '-' + str(number_of_visits+4)] += 1
    #         else:
    #             number_of_visits += 4
    #             result[str(number_of_visits) + '-' + str(number_of_visits+4)] = 1
    #     total_visits = len(Statistics.objects.all())
    #     return {"Total of users grouped by number of visits": result, "Total Visits": total_visits}

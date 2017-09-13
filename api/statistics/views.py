from statistics.models import *
from statistics.serializers import *

import django_filters
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
import datetime
import json
import copy
from django.contrib.auth.models import User

class StatisticsViewSet(viewsets.ModelViewSet):
    queryset = Statistics.objects.all()

    serializer_class = StatisticsSerializer


@api_view(['GET'])
def user_by_date(request):
    if request.method == 'GET':
        date_params = request.query_params.get('date', None)
        date = datetime.datetime.strptime(date_params, "%Y-%m-%d")
        day_min = datetime.datetime.combine(date, datetime.time.min)
        day_max = datetime.datetime.combine(date, datetime.time.max)
        queryset = Statistics.objects.filter(date__range=(day_min, day_max))
        users = dict()
        for statistic in queryset:
            email = statistic.owner.email
            if email not in users:
                users[email] = 1
            else:
                users[email] += 1
        return Response(users)

@api_view(['GET'])
def visits_and_recent_login(request):
    if request.method == 'GET':
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
        return Response(results)

@api_view(['GET'])
def total_visits(request):
    if request.method == 'GET':
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
        return Response({"Total of users grouped by number of visits": result, "Total Visits": total_visits})

@api_view(['GET'])
def visits_per_month(request):
    if request.method == 'GET':
        results = dict()
        statistics = Statistics.objects.all().order_by('-date')
        for statistic in statistics:
            if statistic.date.strftime("%Y-%m") not in results.keys():
                results[statistic.date.strftime("%Y-%m")] = 1
            else:
                results[statistic.date.strftime("%Y-%m")] += 1
        return Response({"Visits Per Month": results})

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
        users = []
        for statistic in queryset:
            if statistic.owner.email not in users:
                users.append(copy.copy(statistic.owner.email))
        return Response(dict({'users': users}))

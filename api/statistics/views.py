from statistics.models import *
from statistics.serializers import *

import django_filters
from rest_framework import filters
from rest_framework import viewsets


class StatisticsViewSet(viewsets.ModelViewSet):
    queryset = Statistics.objects.all()

    serializer_class = StatisticsSerializer

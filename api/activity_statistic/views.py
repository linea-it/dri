from django.shortcuts import render

from .models import Activity
from .serializers import ActivityStatisticSerializer
from rest_framework import viewsets

class ActivityStatisticViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()

    serializer_class = ActivityStatisticSerializer

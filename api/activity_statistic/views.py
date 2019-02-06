from django.shortcuts import render

from .models import Activity
from .serializers import ActivityStatisticSerializer
from rest_framework import viewsets

class ActivityStatisticViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()

    serializer_class = ActivityStatisticSerializer

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)
from django.shortcuts import render
from rest_framework import viewsets
from .models import Position
from .serializers import PositionSerializer


class PositionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Comment by Position to be viewed or edited
    """
    queryset = Position.objects.all()

    serializer_class = PositionSerializer

    filter_fields = ('id', 'owner', 'pst_dataset', 'pst_ra',
                     'pst_dec', 'pst_date', 'pst_comment',)

    ordering_fields = ('pst_date',)

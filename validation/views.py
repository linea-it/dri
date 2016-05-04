import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets

from validation.models import Features
from validation.serializers import FeaturesSerializer

logger = logging.getLogger(__name__)

class FeaturesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    queryset = Features.objects.all()

    serializer_class = FeaturesSerializer

    search_fields = ('ftr_name',)

    filter_fields = ('id', 'ftr_name',)

    ordering_fields = '__all__'


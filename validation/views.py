import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets

from validation.models import Feature, Flagged, Defect
from validation.serializers import FeatureSerializer, FlaggedSerializer, DefectSerializer

logger = logging.getLogger(__name__)

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

    search_fields = ('ftr_name',)
    filter_fields = ('id', 'ftr_name',)
    ordering_fields = '__all__'

class FlaggedViewSet(viewsets.ModelViewSet):
    queryset = Flagged.objects.all()
    serializer_class = FlaggedSerializer

    search_fields = ('flg_user','flg_dataset','flg_flagged')
    filter_fields = ('id', 'flg_flagged',)
    ordering_fields = '__all__'

class DefectViewSet(viewsets.ModelViewSet):
    queryset = Defect.objects.all()
    serializer_class = DefectSerializer

    search_fields = ('dfc_ra','dfc_dec')
    filter_fields = ('id','dfc_ra','dfc_dec',)
    ordering_fields = '__all__'

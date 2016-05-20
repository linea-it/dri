import logging

# from validation.models import Feature, Flagged, Defect
from validation.models import *
# from validation.serializers import FeatureSerializer, FlaggedSerializer, DefectSerializer
from validation.serializers import *

import django_filters
from common.filters import *
from rest_framework import filters
from rest_framework import viewsets

logger = logging.getLogger(__name__)

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.select_related().all()
    serializer_class = FeatureSerializer

    search_fields = ('ftr_name',)
    filter_fields = ('id', 'ftr_name',)
    ordering_fields = '__all__'

class FlaggedFilter(django_filters.FilterSet):
    release = django_filters.MethodFilter()

    class Meta:
        model = Flagged
        fields = ['flg_dataset', 'flg_flagged', 'release', ]

    def filter_release(self, queryset, value):
        # f.dataset.tag.tag_release.rls_name
        return queryset.filter(flg_dataset__tag__tag_release__id=int(value))

class FlaggedViewSet(viewsets.ModelViewSet):
    queryset = Flagged.objects.all()

    serializer_class = FlaggedSerializer

    filter_backends = (IsOwnerFilterBackend, filters.DjangoFilterBackend)

    filter_class = FlaggedFilter


class DefectViewSet(viewsets.ModelViewSet):
    queryset = Defect.objects.all()

    serializer_class = DefectSerializer

    search_fields = ('dfc_dataset', 'dfc_ra', 'dfc_dec')

    filter_fields = ('id', 'dfc_dataset', 'dfc_ra', 'dfc_dec',)

    ordering_fields = '__all__'

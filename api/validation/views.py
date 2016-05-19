import logging

from validation.models import Feature, Flagged, Defect
from validation.serializers import FeatureSerializer, FlaggedSerializer, DefectSerializer

import django_filters
from rest_framework import filters
from rest_framework import viewsets

logger = logging.getLogger(__name__)

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.select_related().all()
    serializer_class = FeatureSerializer

    search_fields = ('ftr_name',)
    filter_fields = ('id', 'ftr_name',)
    ordering_fields = '__all__'


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    """
    Filter that only allows users to see their own objects.
    """

    def filter_queryset(self, request, queryset, view):
        return queryset.filter(flg_user=request.user)


class FlaggedFilter(django_filters.FilterSet):
    release = django_filters.MethodFilter()

    class Meta:
        model = Flagged
        fields = ['flg_dataset', 'flg_flagged', 'release', ]

    def filter_release(self, queryset, value):
        # f.flg_dataset.tag.tag_release.rls_name
        return queryset.filter(flg_dataset__tag__tag_release__id=int(value))

class FlaggedViewSet(viewsets.ModelViewSet):
    queryset = Flagged.objects.all()

    serializer_class = FlaggedSerializer

    filter_backends = (IsOwnerFilterBackend,)

    filter_class = FlaggedFilter

class DefectViewSet(viewsets.ModelViewSet):
    queryset = Defect.objects.all()
    serializer_class = DefectSerializer

    search_fields = ('dfc_ra','dfc_dec')
    filter_fields = ('id','dfc_ra','dfc_dec',)
    ordering_fields = '__all__'

import logging

# from validation.models import Feature, Flagged, Defect
from validation.models import *
# from validation.serializers import FeatureSerializer, FlaggedSerializer, DefectSerializer
from validation.serializers import *

import django_filters
from common.filters import *
from rest_framework import filters
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import list_route
from rest_framework.response import Response

logger = logging.getLogger(__name__)


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.select_related().all()
    serializer_class = FeatureSerializer

    search_fields = ('ftr_name',)
    filter_fields = ('id', 'ftr_name',)
    ordering_fields = '__all__'


class FlaggedFilter(django_filters.FilterSet):
    release = django_filters.CharFilter(method='filter_release')

    class Meta:
        model = Flagged
        fields = ['flg_dataset', 'flg_flagged', 'release', ]

    def filter_release(self, queryset, name, value):
        # f.dataset.tag.tag_release.rls_name
        return queryset.filter(flg_dataset__tag__tag_release__id=int(value))


class FlaggedViewSet(viewsets.ModelViewSet):
    queryset = Flagged.objects.all()

    serializer_class = FlaggedSerializer

    filter_backends = (IsOwnerFilterBackend, DjangoFilterBackend)

    filter_class = FlaggedFilter

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class InspectFilter(django_filters.FilterSet):
    release = django_filters.CharFilter(method='filter_release')

    class Meta:
        model = Inspect
        fields = ['isp_dataset', 'isp_value', 'release', ]

    def filter_release(self, queryset, name, value):
        # f.dataset.tag.tag_release.rls_name
        return queryset.filter(isp_dataset__tag__tag_release__id=int(value))


class InspectViewSet(viewsets.ModelViewSet):
    queryset = Inspect.objects.all()

    serializer_class = InspectSerializer

    filter_backends = (DjangoFilterBackend)

    filter_class = InspectFilter

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class DefectViewSet(viewsets.ModelViewSet):
    queryset = Defect.objects.all()

    serializer_class = DefectSerializer

    search_fields = ('dfc_dataset', 'dfc_ra', 'dfc_dec')

    filter_fields = ('id', 'dfc_dataset', 'dfc_filter', 'dfc_feature', 'dfc_ra', 'dfc_dec',)

    ordering_fields = '__all__'

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class UserEmailViewSet(viewsets.ModelViewSet):
    queryset = UserEmail.objects.all()

    serializer_class = UserEmailSerializer

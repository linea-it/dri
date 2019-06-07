import logging

from rest_framework import serializers
from .models import Feature, Flagged, Inspect, Defect, UserEmail
from coadd.models import Dataset
from common.models import Filter

logger = logging.getLogger(__name__)


class FeatureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Feature

        fields = (
            'id',
            'ftr_name',
        )


class FlaggedSerializer(serializers.HyperlinkedModelSerializer):
    flg_dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all())

    # owner = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Flagged

        fields = (
            'id',
            # 'owner',
            'flg_dataset',
            'flg_flagged',
        )


class InspectSerializer(serializers.HyperlinkedModelSerializer):
    isp_dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all())

    # owner = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Inspect

        fields = (
            'id',
            # 'owner',
            'isp_dataset',
            'isp_value',
        )


class DefectSerializer(serializers.HyperlinkedModelSerializer):
    dfc_dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all())
    dfc_filter = serializers.PrimaryKeyRelatedField(queryset=Filter.objects.all())
    dfc_feature = serializers.PrimaryKeyRelatedField(queryset=Feature.objects.all())

    class Meta:
        model = Defect

        fields = (
            'id',
            'dfc_dataset',
            'dfc_filter',
            'dfc_feature',
            'dfc_ra',
            'dfc_dec',
        )


class UserEmailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserEmail

        fields = (
            'id',
            'email',
        )

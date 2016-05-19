import logging

from coadd.models import Dataset

from rest_framework import serializers
from .models import Feature, Flagged, Defect

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

    class Meta:
        model = Flagged

        fields = (
            'id',
            'flg_dataset',
            'flg_flagged',
        )

class DefectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Defect

        fields = (
            'id',
            'dfc_ra',
            'dfc_dec',
        )



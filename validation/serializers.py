import logging

from rest_framework import serializers

from .models import Feature, Flagged

logger = logging.getLogger(__name__)

class FeatureSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Feature

        fields = (
            'id',
            'ftr_name',
        )

class FlaggedSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Flagged

        fields = (
            'id',
            'flg_user',
            'flg_dataset',
            'flg_flagged',
        )

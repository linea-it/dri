import logging

from rest_framework import serializers

from .models import Features, Flagged

logger = logging.getLogger(__name__)

class FeaturesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Features

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

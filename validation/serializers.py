import logging

from rest_framework import serializers

from .models import Features

logger = logging.getLogger(__name__)

class FeaturesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Features

        fields = (
            'id',
            'ftr_name',
        )



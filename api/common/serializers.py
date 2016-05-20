from .models import Filter
from rest_framework import serializers

class FilterSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Filter

        fields = (
            'id',
            'project',
            'filter',
            'lambda_min',
            'lambda_max',
            'lambda_mean'
        )
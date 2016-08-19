from .models import Filter
from rest_framework import serializers
from django.contrib.auth.models import User

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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = (
            'username',
        )
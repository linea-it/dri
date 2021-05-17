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

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            'id',
            'username',
            'display_name'
        )

    def get_display_name(self, obj):
        try:
            display_name = obj.profile.display_name
            if display_name is not None:
                return display_name
            else:
                return obj.username
        except:
            return obj.username

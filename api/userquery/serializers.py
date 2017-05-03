from rest_framework import serializers
from .models import UserQuery
from django.contrib.auth.models import User


class UserQuerySerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = UserQuery
        fields = (
            'id',
            'owner',
            'name',
            'query',
            'tablename',
            'creationdate',
            'is_public',
            'description'
        )
        



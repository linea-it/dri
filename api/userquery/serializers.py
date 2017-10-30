from rest_framework import serializers
from .models import Query


class UserQuerySerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = Query
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

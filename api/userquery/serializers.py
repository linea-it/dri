from rest_framework import serializers
from .models import Query


class UserQuerySerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = Query
        fields = (
            'id',
            'name',
            'description',
            'owner',
            'creation_date',
            'last_edition_date',
            'table_name',
            'query',
            'is_validate',
            'is_public'
        )

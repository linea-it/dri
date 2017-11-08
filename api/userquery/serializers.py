from rest_framework import serializers
from .models import *


class QuerySerializer(serializers.HyperlinkedModelSerializer):
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
            'sql_sentence',
            'is_validate',
            'is_public'
        )


class JobSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = Job
        fields = (
            'id',
            'owner',
            'start_date_time',
            'end_date_time',
            'sql_sentence',
            'timeout',
        )

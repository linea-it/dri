from rest_framework import serializers
from .models import *


class QuerySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = Query
        fields = (
            'id',
            'name',
            'description',
            'owner',
            'release',
            'creation_date',
            'last_edition_date',
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
            'table_name',
            'owner',
            'start_date_time',
            'end_date_time',
            'sql_sentence',
            'job_status',
            'timeout',
        )

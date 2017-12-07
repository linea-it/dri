from rest_framework import serializers
from .models import *
from product.models import Product


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
            'is_public'
        )


class JobSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()

    class Meta:
        model = Job
        fields = (
            'id',
            'display_name',
            'owner',
            'start_date_time',
            'end_date_time',
            'sql_sentence',
            'job_status',
            'timeout',
        )


class TableSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    id = serializers.ReadOnlyField()
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    class Meta:
        model = Table
        fields = (
            'id',
            'table_name',
            'display_name',
            'owner',
            'schema',
            'product_id',
            'release'
        )

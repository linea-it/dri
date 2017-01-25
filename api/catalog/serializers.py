from rest_framework import serializers
from rest_framework.fields import IntegerField, BooleanField, ReadOnlyField

from .models import Rating, Reject

class RatingSerializer(serializers.HyperlinkedModelSerializer):
    catalog_id = IntegerField(allow_null=False)
    object_id = IntegerField(min_value=0, allow_null=False, required=True)
    rating = IntegerField(min_value=1, max_value=5, allow_null=False, required=True)

    class Meta:

        model = Rating

        fields = (
            'id',
            'catalog_id',
            'object_id',
            'rating'
        )


class RejectSerializer(serializers.HyperlinkedModelSerializer):
    catalog_id = IntegerField(allow_null=False)
    object_id = IntegerField(min_value=0, allow_null=False, required=True)
    reject = BooleanField(default=False)

    class Meta:
        model = Reject

        fields = (
            'id',
            'catalog_id',
            'object_id',
            'reject'
        )

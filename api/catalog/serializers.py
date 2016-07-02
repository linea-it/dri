from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import IntegerField
from rest_framework.relations import PrimaryKeyRelatedField
from .models import Rating
from product.models import Catalog

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


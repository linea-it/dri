from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Rating

        fields = (
            'id',
            'catalog_id',
            'owner',
            'object_id',
            'rating'
        )
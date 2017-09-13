from rest_framework import serializers
from .models import Statistics

class StatisticsSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Statistics

        fields = (
            'owner',
            'event',
            'date',
        )

    def get_owner(self, obj):
        return obj.owner.username

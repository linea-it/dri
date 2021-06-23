from rest_framework import serializers
from .models import Activity


class ActivityStatisticSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Activity

        fields = (
            'owner',
            'event',
            'date',
        )

    def get_owner(self, obj):
        try:
            return obj.owner.username
        except:
            return None

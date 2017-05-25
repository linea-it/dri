from rest_framework import serializers
from .models import Position
from coadd.models import Dataset
from common.models import Filter


class PositionSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.SerializerMethodField()
    pst_dataset = serializers.PrimaryKeyRelatedField(
        queryset=Dataset.objects.all(), many=False)
    pst_filter = serializers.PrimaryKeyRelatedField(
        queryset=Filter.objects.all(), many=False)

    class Meta:
        model = Position

        fields = (
            'id',
            'owner',
            'pst_dataset',
            'pst_filter',
            'pst_ra',
            'pst_dec',
            'pst_date',
            'pst_comment',
        )

    def get_owner(self, obj):
        return obj.owner.username

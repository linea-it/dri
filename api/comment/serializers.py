from rest_framework import serializers
from .models import Position
from .models import Dataset as CommentDataset
from coadd.models import Dataset
from common.models import Filter


class PositionSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.SerializerMethodField()
    pst_dataset = serializers.PrimaryKeyRelatedField(
        queryset=Dataset.objects.all(), many=False)
    pst_date = serializers.SerializerMethodField()

    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Position

        fields = (
            'id',
            'owner',
            'pst_dataset',
            'pst_ra',
            'pst_dec',
            'pst_date',
            'pst_comment',
            'is_owner'
        )

    def get_owner(self, obj):
        return obj.owner.username

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.owner.pk == current_user.pk:
            return True
        else:
            return False

    def get_pst_date(self, obj):
        try:
            return obj.pst_date.strftime('%Y-%m-%d %H:%M')
        except:
            return None


class CommentDatasetSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    dts_dataset = serializers.PrimaryKeyRelatedField(
        queryset=Dataset.objects.all(), many=False)
    dts_date = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    tilename = serializers.SerializerMethodField()
    isp_value = serializers.SerializerMethodField()

    class Meta:
        model = CommentDataset

        fields = (
            'id',
            'dts_dataset',
            'dts_date',
            'dts_comment',
            'dts_type',
            'dts_ra',
            'dts_dec',
            'owner',
            'is_owner',
            'tilename',
            'isp_value'
        )

    def get_owner(self, obj):
        return obj.owner.username

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.owner.pk == current_user.pk:
            return True
        else:
            return False

    def get_dts_date(self, obj):
        try:
            return obj.dts_date.strftime('%Y-%m-%d %H:%M')
        except:
            return None

    def get_tilename(self, obj):
        try:
            return obj.dts_dataset.tile.tli_tilename
        except:
            return None

    def get_isp_value(self, obj):
        try:
            return obj.dts_dataset.inspected.isp_value
        except:
            return None

from rest_framework import serializers
from rest_framework.fields import IntegerField, BooleanField, ReadOnlyField, CharField
from django.contrib.auth.models import User
from .models import Rating, Reject, Comments


class RatingSerializer(serializers.HyperlinkedModelSerializer):
    catalog_id = IntegerField(allow_null=False)
    object_id = CharField(min_length=1, max_length=255, allow_null=False, required=True)
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
    object_id = CharField(min_length=1, max_length=255, allow_null=False, required=True)
    reject = BooleanField(default=False)

    class Meta:
        model = Reject

        fields = (
            'id',
            'catalog_id',
            'object_id',
            'reject'
        )


class CommentsSerializer(serializers.HyperlinkedModelSerializer):
    catalog_id = IntegerField(allow_null=False)
    object_id = CharField(min_length=1, max_length=255, allow_null=False, required=True)
    owner = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    is_owner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comments

        fields = (
            'id',
            'date',
            'catalog_id',
            'object_id',
            'owner',
            'is_owner',
            'comments',
        )

    def get_owner(self, obj):
        try:
            user = User.objects.get(pk=obj.owner)
            return user.username
        except:
            return None

    def get_date(self, obj):
        try:
            return obj.date.strftime('%Y-%m-%d %H:%M')
        except:
            return None

    def get_is_owner(self, obj):
        current_user = self.context['request'].user
        if obj.owner == current_user.pk:
            return True
        else:
            return False

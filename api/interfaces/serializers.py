import logging

from rest_framework import serializers
from .models import Application, Tutorial

logger = logging.getLogger(__name__)

class ApplicationSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Application 

        fields = (
            'id',
            'app_name',
            'app_display_name',
            'app_url',
            'app_short_description',
            'app_long_description',
            'app_icon_cls',
            'app_icon_src',
            'app_video_src',
            'app_order',
            'app_disabled'
        )

class TutorialSerializer(serializers.HyperlinkedModelSerializer):

    application = serializers.PrimaryKeyRelatedField(
        queryset=Application.objects.all(), many=False)

    application_display_name = serializers.SerializerMethodField()

    class Meta:

        model = Tutorial

        fields = (
            'id',
            'application',
            'application_display_name',
            'ttr_title',
            'ttr_src',
            'ttr_description',
        )

    def get_application_display_name(self, obj):
        return obj.application.app_display_name
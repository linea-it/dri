import logging

from rest_framework import serializers
from .models import Application 

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


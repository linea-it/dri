import logging

from .models import *
from django.contrib.auth.models import User
from rest_framework import serializers

logger = logging.getLogger(__name__)

class UserQuerySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserQuery

        fields = (
            'name',
            'query',
            'tablename',
            'creationdate',
            'is_public',
            'description'
        )



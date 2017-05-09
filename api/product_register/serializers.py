import logging

from rest_framework import serializers
from .models import Export, ExternalProcess, Site, Authorization
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class SiteSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Site

        fields = (
            'id',
            'sti_user',
            'sti_name',
            'sti_url',
        )

class ExportSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Export

        fields = (
            'id',
            'exp_username',
            'exp_date',
            'exp_product_id',
            'exp_external_process'
        )

class ExternalProcessSerializer(serializers.HyperlinkedModelSerializer):

    epr_owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=False)

    epr_site = serializers.PrimaryKeyRelatedField(
        queryset=Site.objects.all(), many=False)

    class Meta:

        model = ExternalProcess

        fields = (
            'id',
            'epr_owner',
            'epr_name',
            'epr_username',
            'epr_start_date',
            'epr_end_date',
            'epr_readme',
            'epr_comment',
            'epr_original_id',
            'epr_site'
        )

class AuthorizationSerializer(serializers.HyperlinkedModelSerializer):

    ticket = serializers.SerializerMethodField()

    class Meta:

        model = Authorization

        fields = (
            'ticket',
        )

    def get_ticket(self, obj):
        return obj.ath_ticket

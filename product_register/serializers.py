import logging

from rest_framework import serializers
from .models import Export 
from .models import ExternalProcess 
from .models import Site 

logger = logging.getLogger(__name__)


class ExportSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Export

        fields = (
            'exp_id',
            'exp_username',
            'exp_date',
            'exp_product_id',
            'exp_external_process'
        )

class ExternalProcessSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = ExternalProcess

        fields = (
            'epr_id',
            'epr_name',
            'epr_username',
            'epr_start_date',
            'epr_end_date',
            'epr_readme',
            'epr_comment',
            'epr_original_id',
            'epr_site'
        )

class SiteSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Site

        fields = (
            'ste_id',
            'ste_name',
            'ste_url'
        )

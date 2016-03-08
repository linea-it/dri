from .models import Release
from rest_framework import serializers

class ReleaseSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Release
        fields = ('rls_name', 'rls_version', 'rls_date', 'rls_description', 'rls_doc_url', 'rls_display_name')

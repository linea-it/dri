from .models import Release
from .models import Tag
from rest_framework import serializers

class ReleaseSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Release
        fields = (
            'rls_name',
            'rls_display_name',
            'rls_version',
            'rls_date',
            'rls_doc_url',
            'rls_description'
        )

class TagSerializer(serializers.HyperlinkedModelSerializer):

    tag_release = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tag

        fields = (
            'tag_release',
            'tag_name',
            'tag_display_name',
            'tag_status',
            'tag_install_date',
            'tag_release_date',
            'tag_start_date',
            'tag_discovery_date',
        )
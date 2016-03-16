from .models import Release, Tag, Tile, Tag_Tile
from rest_framework import serializers

class ReleaseSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:

        model = Release

        fields = (
            'id',
            'rls_name',
            'rls_display_name',
            'rls_version',
            'rls_date',
            'rls_doc_url',
            'rls_description',
        )

class TagSerializer(serializers.HyperlinkedModelSerializer):

    tag_release = serializers.PrimaryKeyRelatedField(read_only=True)
    # tag_release = ReleaseSerializer(read_only=True)
    class Meta:

        model = Tag

        fields = (
            'id',
            'tag_release',
            'tag_name',
            'tag_display_name',
            'tag_status',
            'tag_install_date',
            'tag_release_date',
            'tag_start_date',
            'tag_discovery_date',
        )

class TileSerializer(serializers.HyperlinkedModelSerializer):


    class Meta:

        model = Tile

        fields = (
            'id',
            'tli_tilename',
            'tli_project',
            'tli_ra',
            'tli_dec',
            'tli_equinox',
            'tli_pixelsize',
            'tli_npix_ra',
            'tli_npix_dec',
            'tli_rall',
            'tli_decll',
            'tli_raul',
            'tli_decul',
            'tli_raur',
            'tli_decur',
            'tli_ralr',
            'tli_declr',
            'tli_urall',
            'tli_udecll',
            'tli_uraur',
            'tli_udecur',
        )
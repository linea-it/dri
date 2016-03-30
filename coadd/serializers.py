import logging

from rest_framework import serializers
from .models import Release, Tag, Tile, Tag_Tile

logger = logging.getLogger(__name__)

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

class TileSerializer(serializers.HyperlinkedModelSerializer):
    tli_ra = serializers.DecimalField(max_digits=7, decimal_places=4, coerce_to_string=False)
    tli_dec = serializers.DecimalField(max_digits=7, decimal_places=4, coerce_to_string=False)
    tli_raul = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_raur = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_ralr = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_rall = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_decul = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_decur = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_declr = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)
    tli_decll = serializers.DecimalField(max_digits=6, decimal_places=3, coerce_to_string=False)

    class Meta:
        model = Tile

        fields = (
            'id',
            # 'tag_tile_id',
            'tli_tilename',
            # 'tli_project',
            'tli_ra',
            'tli_dec',
            # 'tli_equinox',
            # 'tli_pixelsize',
            # 'tli_npix_ra',
            # 'tli_npix_dec',
            'tli_rall',
            'tli_decll',
            'tli_raul',
            'tli_decul',
            'tli_raur',
            'tli_decur',
            'tli_ralr',
            'tli_declr',
            # 'tli_urall',
            # 'tli_udecll',
            # 'tli_uraur',
            # 'tli_udecur',
        )


class TagSerializer(serializers.HyperlinkedModelSerializer):
    tag_release = serializers.PrimaryKeyRelatedField(read_only=True)

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

class Tag_TileSerializer(serializers.HyperlinkedModelSerializer):
    tag = serializers.PrimaryKeyRelatedField(read_only=True)
    tile = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tag_Tile

        fields = (
            'id',
            'tag',
            'tile',
            'run',
        )


class DatasetSerializer(serializers.HyperlinkedModelSerializer):
    tag = serializers.PrimaryKeyRelatedField(read_only=True)
    tile = TileSerializer(read_only=True)
    release = serializers.PrimaryKeyRelatedField(read_only=True)
    image_src = serializers.SerializerMethodField()

    class Meta:
        model = Tag_Tile

        fields = (
            'id',
            'tag',
            'release',
            'tile',
            'run',
            'image_src',
        )

    def get_image_src(self, obj):
        tag = obj.get('tag')
        release = obj.get('release')

        base_src = "http://10.0.10.30:8152/static/images/tiles/"

        image_src = "%s/%s" % (release.rls_name, tag.tag_name)

        return base_src + image_src

from rest_framework import serializers
from .models import Release, Tag, Tile, Tag_Tile


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
    # tag_tile_id = serializers.SerializerMethodField()

    class Meta:
        model = Tile

        fields = (
            'id',
            # 'tag_tile_id',
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

        # def get_tag_tile_id(self, obj):
        #
        #     tag_tiles = obj.tag_tile_set.all()
        #
        #     if tag_tiles.count() == 1:
        #         tag_tile = tag_tiles.first()
        #
        #         return tag_tile.pk


class Tag_TileSerializer(serializers.HyperlinkedModelSerializer):
    tag = serializers.PrimaryKeyRelatedField(read_only=True)
    # tag = TagSerializer(read_only=True)
    tile = TileSerializer(read_only=True)

    image_src = serializers.SerializerMethodField()

    class Meta:
        model = Tag_Tile

        fields = (
            'id',
            # 'tag_id',
            'tag',
            'tile',
            'run',
            'image_src',
        )

    def get_image_src(self, obj):
        return str('http://10.0.10.30:8152/static/images/tiles/')

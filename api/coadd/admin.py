from django.contrib import admin

from .models import Release, Tile, Tag, Dataset, Survey

class ReleaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'rls_name', 'rls_display_name', 'rls_version',
                    'rls_date', 'rls_description', 'rls_doc_url',
                    'rls_default',)
    list_display_links = ('id', 'rls_name', 'rls_display_name', 'rls_version',
                    'rls_date', 'rls_description', 'rls_doc_url',
                    'rls_default',)
    search_fields = ('id', 'rls_name','rls_display_name',)

class TileAdmin(admin.ModelAdmin):
    list_display = ('id', 'tli_tilename','tli_project','tli_ra','tli_dec','tli_equinox','tli_pixelsize',
    'tli_npix_ra', 'tli_npix_dec', 'tli_rall', 'tli_decll', 'tli_raul',
     'tli_decul', 'tli_raur', 'tli_decur', 'tli_ralr', 'tli_declr',
     'tli_urall', 'tli_udecll', 'tli_uraur', 'tli_udecur',)
    list_display_links = ('id', 'tli_tilename','tli_project','tli_ra','tli_dec','tli_equinox','tli_pixelsize',
    'tli_npix_ra', 'tli_npix_dec', 'tli_rall', 'tli_decll', 'tli_raul',
     'tli_decul', 'tli_raur', 'tli_decur', 'tli_ralr', 'tli_declr',
     'tli_urall', 'tli_udecll', 'tli_uraur', 'tli_udecur',)
    search_fields = ('id', 'tli_tilename','tli_project',)

class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'tag_release','tag_name', 'tag_display_name',
                    'tag_install_date',
                    'tag_release_date','tag_status','tag_start_date','tag_discovery_date',)
    list_display_links = ('id', 'tag_release','tag_name', 'tag_display_name',
                    'tag_install_date',
                    'tag_release_date','tag_status','tag_start_date','tag_discovery_date',)
    search_fields = ('id','tag_release','tag_name','tag_display_name',)

class DatasetAdmin(admin.ModelAdmin):
    list_display = ('id','tag','tile','run',)
    list_display_links = ('id','tag','tile','run',)
    search_fields = ('id','tag','tile','run',)

class SurveyAdmin(admin.ModelAdmin):
    list_display = ('id', 'srv_release','srv_filter',  'srv_project', 'srv_display_name',
                    'srv_url', 'srv_target', 'srv_fov',)
    list_display_links = ('id', 'srv_release','srv_filter',  'srv_project', 'srv_display_name',
                    'srv_url', 'srv_target', 'srv_fov',)
    search_fields = ('id', 'srv_release', 'srv_project', 'srv_display_name')


admin.site.register(Release, ReleaseAdmin)
admin.site.register(Tile, TileAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Dataset, DatasetAdmin)
admin.site.register(Survey, SurveyAdmin)

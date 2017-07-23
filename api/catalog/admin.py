from django.contrib import admin

# Register your models here.
# from .models import Rating, Reject, Comments
#
# class RatingAdmin(admin.ModelAdmin):
#
#
#     list_display = (
#         'id', 'catalog_id', 'owner', 'object_id', 'rating'
#     )
#
#     search_fields = ('catalog_id', 'owner', 'object_id')
#
#
#
# admin.site.register(Rating, RatingAdmin)

from .models import Reject


class RejectAdmin(admin.ModelAdmin):


    list_display = (
        'id', 'catalog_id', 'object_id', 'reject'
    )

    search_fields = ('catalog_id', 'object_id')



admin.site.register(Reject, RejectAdmin)

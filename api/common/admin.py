from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Filter, Profile


class FilterAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'filter', 'lambda_min', 'lambda_max',
                    'lambda_mean',)
    list_display_links = ('id', 'project', 'filter', 'lambda_min', 'lambda_max',
                          'lambda_mean',)
    search_fields = ('id', 'project', 'filter',)


admin.site.register(Filter, FilterAdmin)


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline, )

    list_display = ('username', 'get_display_name', 'email', 'first_name',
                    'last_name', 'is_staff', 'get_group')

    list_select_related = ('profile', )

    def get_display_name(self, instance):
        return instance.profile.display_name

    get_display_name.short_description = 'Display Name'

    def get_group(self, instance):
        groups = instance.groups.all()
        a_groups = []
        for group in groups:
            a_groups.append(group.name)

        return ', '.join(a_groups)

    get_group.short_description = 'Groups'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

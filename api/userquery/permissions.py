from rest_framework import permissions
from django.db.models import Q


class IsOwnerOrPublic(permissions.BasePermission):
    """
        Filter that only allows users to see their own user queries,
        or public user queries
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or obj.is_public

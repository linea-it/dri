from rest_framework import permissions
from django.db.models import Q


class IsOwnerOrPublic(permissions.BasePermission):
    """
        Filter that only allows users to see their own user queries,
        or public user queries
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return obj.owner == request.user or obj.is_public

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user


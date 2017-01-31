from rest_framework import filters
from django.db.models import Q
class ProductPermissionFilterBackend(filters.BaseFilterBackend):
    """
        Filter that only allows users to see their own products,
        or public products
    """

    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            # Apenas do mesmo usuario ou publico
            Q(prd_owner=request.user) | Q(prd_is_public=True),

            # TODO aplicar as permissoes por grupos ou por usuarios

            # Nao marcados como removidos
            prd_flag_removed=False
        )
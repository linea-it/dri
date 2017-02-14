from rest_framework import filters
from django.db.models import Q
class ProductPermissionFilterBackend(filters.BaseFilterBackend):
    """
        Filter that only allows users to see their own products,
        or public products
    """

    def filter_queryset(self, request, queryset, view):
        return queryset.filter(
            # Apenas do mesmo usuario
            Q(prd_owner=request.user)

            # Ou publico
            | Q(prd_is_public=True)

            # OU por usuario. usuario logado esta na tabela de permissao usuario produto.
            | Q(permission__prm_user=request.user)

            # OU por grupo. o usuario logado esta em um dos workgroups permitidos para o produto
            | Q(permission__prm_workgroup__workgroupuser__wgu_user=request.user)

        )
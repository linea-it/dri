from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route
from rest_framework import filters
from django.db.models import Q
import django_filters
from .models import ProductClass, ProductGroup, ProductClassContent
from .serializers import ProductClassSerializer, ProductGroupSerializer, ProductClassContentSerializer
from django_filters.rest_framework import DjangoFilterBackend

class ProductClassViewSet(viewsets.ModelViewSet):
    queryset = ProductClass.objects.all()

    serializer_class = ProductClassSerializer

    search_fields = ('pcl_name', 'pcl_display_name')

    filter_fields = ('id', 'pcl_name', 'pcl_display_name', 'pcl_group')

    ordering_fields = ('id', 'pcl_name', 'pcl_display_name')


class ProductGroupViewSet(viewsets.ModelViewSet):
    queryset = ProductGroup.objects.all()

    serializer_class = ProductGroupSerializer

    search_fields = ('pgr_name', 'pgr_display_name')

    filter_fields = ('id', 'pgr_name', 'pgr_display_name', 'is_catalog')

    ordering_fields = ('pgr_name', 'pgr_display_name')

    @list_route()
    def get_group(self, request):
        queryset = ProductGroup.objects.select_related().filter(is_catalog=True)
        result = {
            "expanded": True,
            "children": list()
        }

        for row in queryset:
            result['children'].append({
                "text": "%s" % row.pgr_name,
                "expanded": False,
                "leaf": True
            })
        # return Response(dict({'success':True}))
        return Response(result)


class ProductClassContentFilter(django_filters.FilterSet):
    pcc_class = django_filters.CharFilter(method='filter_pcc_class')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = ProductClassContent
        fields = ['id', 'pcc_class', 'pcc_category', 'pcc_name', 'pcc_display_name', 'pcc_ucd', 'search']

    def filter_pcc_class(self, queryset, name, value):
        return queryset.filter(
            Q(pcc_class=int(value)) | Q(pcc_class__isnull=True))

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(pcc_name__icontains=value) | Q(pcc_display_name__icontains=value) | Q(pcc_ucd__icontains=value)
        ).order_by('-pcc_mandatory', 'pcc_display_name')


class ProductClassContentViewSet(viewsets.ModelViewSet):
    queryset = ProductClassContent.objects.all()

    serializer_class = ProductClassContentSerializer

    search_fields = ('pcc_name', 'pcc_display_name', 'pcc_ucd')

    filter_backends = (DjangoFilterBackend,)

    filter_class = ProductClassContentFilter

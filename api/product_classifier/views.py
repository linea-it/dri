import logging

import django_filters
from common.filters import *
from rest_framework import filters, viewsets, generics, permissions

from .models import ProductClass, ProductGroup
from .serializers import ProductClassSerializer, ProductGroupSerializer

logger = logging.getLogger(__name__)

class ProductClassViewSet(viewsets.ModelViewSet):

    queryset = ProductClass.objects.all()
    serializer_class = ProductClassSerializer
    search_fields = ('pcl_name', 'pcl_display_name')
    filter_fields = ('id', 'pcl_name', 'pcl_display_name')
    ordering_fields = ('id', 'pcl_name', 'pcl_display_name')

class ProductGroupFilter(django_filters.FilterSet):
    target = django_filters.MethodFilter()

    class Meta:
        model = ProductGroup
        fields = ['pgr_name', 'pgr_display_name', 'target']

    def filter_target(self, queryset, value):
        return queryset.filter(prd_class__pcl_group__pgr_name=value)


#class ProductGroupViewSet(viewsets.ModelViewSet):
#
#    queryset = ProductGroup.objects.all()
#    serializer_class = ProductGroupSerializer
#
#    filter_backends = (IsOwnerFilterBackend, filters.DjangoFilterBackend)
#
#    filter_class = ProductGroupFilter

class ProductGroupViewSet(viewsets.ViewSet,
                          generics.GenericAPIView):

    # queryset = ProductGroup.objects.select_related().all()

    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    serializer_class = ProductGroupSerializer


    def get_queryset(self):
        logger.info('-----------------get_queryset-----------')
        pass

    def retrieve(self, request, pk=None):

        obj = get_object_or_404(ProductGroup, pk=pk)

        serializer = ProductGroupSerializer(obj)

        return Response(serializer.data)


    def list(self, request):
        logger.info('-----------------list---------------------')

        pgr_name = request.query_params.get('prd_class__pcl_group__pgr_name', None)
        if pgr_name:
            queryset = get_list_or_404(ProductGroup.objects.select_related().filter(),
                                       pgr_name=pgr_name)

        pgr_display_name_in = request.query_params.get('prd_class__pcl_group__pgr_display_name__in', None)
        if pgr_display_name_in:
            ids = map(int, pgr_display_name_in.split(','))

            queryset = get_list_or_404(ProductGroup.objects.select_related().filter(),
                                       pgr_display_name__in=ids)

        page = self.paginate_queryset(queryset)

        logger.info('--------------------------------------')

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        else:
            serializer = ProductGroupSerializer(queryset, many=True)
            content = Response({
                'count': len(queryset),
                'results': serializer.data,
            })

            return content



#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
from .models import Product, Catalog, ProductContent, ProductContentAssociation
from .serializers import ProductSerializer, CatalogSerializer, ProductContentSerializer, \
    ProductContentAssociationSerializer

logger = logging.getLogger(__name__)


class ProductFilter(django_filters.FilterSet):
    group = django_filters.MethodFilter()

    class Meta:
        model = Product
        fields = ['prd_name', 'prd_display_name', 'prd_class', 'group']

    def filter_group(self, queryset, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Product.objects.select_related().all()

    serializer_class = ProductSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = ProductFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')


class CatalogFilter(django_filters.FilterSet):
    group = django_filters.MethodFilter()

    class Meta:
        model = Product
        fields = ['prd_name', 'prd_display_name', 'prd_class', 'group']

    def filter_group(self, queryset, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))


# Create your views here.
class CatalogViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Catalog.objects.select_related().all()

    serializer_class = CatalogSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = CatalogFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')

    @list_route()
    def get_class_tree_by_group(self, request):
        """
            Este metodo retorna uma tree, com todos os produtos de um grupo. estes produtos estão
            agrupados por suas classes.
            é necessario o parametro group que é o internal name da tabela Group
            ex: catalog/get_class_tree_by_group/group='targets'
        """
        group = request.query_params.get('group', None)

        if not group:
            # TODO retornar execpt que o group e obrigatorio
            return Response({
                'success': False,
                'msg': 'Necessário passar o parametro group.'
            })

        queryset = self.queryset.filter(
            prd_class__pcl_group__pgr_name=str(group),
            prd_flag_removed=False
        )

        # Search
        prd_display_name = request.query_params.get('search', None)
        if prd_display_name:
            queryset = self.queryset.filter(prd_display_name__icontains=prd_display_name)

        # Esse dicionario vai receber os nos principais que sao as classes.
        classes = dict()

        for row in queryset:
            # Internal name da classe
            class_name = str(row.prd_class.pcl_name)

            # Verifica se ja existe um no para essa classe
            # se nao existir cria um no e adiciona ao dict classes
            if classes.get(class_name) is None:
                classes.update({
                    class_name: dict({
                        "text": "%s" % row.prd_class.pcl_display_name,
                        "expanded": False,
                        "children": list()
                    })
                })

            # Cria um dict usando o Serializer setado neste Viewset
            catalog = self.get_serializer(row).data

            # Adiciono os atributos que serao usados pela interface
            # esse dict vai ser um no filho de um dos nos de classe.
            catalog.update({
                "text": row.prd_display_name,
                "leaf": True,
                "iconCls": "no-icon",
                "starred": False,
                "markable": True
            })

            # pega o no da classe e adiciona este no como filho.
            dclass = classes.get(class_name)
            dclass.get('children').append(catalog)

        result = dict({
            'success': True,
            'expanded': True,
            'children': list()
        })

        for class_name in classes:
            # result.get("root").get('children').append(classes.get(class_name))
            result.get('children').append(classes.get(class_name))

        return Response(result)


class ProductContentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content to be viewed or edited
    """
    queryset = ProductContent.objects.select_related().all()

    serializer_class = ProductContentSerializer

    filter_fields = ('id', 'pcn_product_id', 'pcn_column_name',)

    ordering_fields = ('id', 'pcc_column_name',)


class ProductContentAssociationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content Association to be viewed or edited
    """
    queryset = ProductContentAssociation.objects.select_related().all()

    serializer_class = ProductContentAssociationSerializer

    filter_fields = ('id', 'pca_product', 'pca_class_content', 'pca_product_content')

    ordering_fields = ('id',)

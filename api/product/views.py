#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets
from rest_framework import mixins
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.db.models import Q
from common.filters import IsOwnerFilterBackend
from .models import Product, Catalog, Map, Mask, CutOutJob, ProductContent, ProductContentAssociation, ProductSetting, \
    CurrentSetting, ProductContentSetting, Permission, WorkgroupUser
from .serializers import *

from .filters import ProductPermissionFilterBackend
import operator

logger = logging.getLogger(__name__)


class ProductFilter(django_filters.FilterSet):
    group = django_filters.MethodFilter()
    group_id = django_filters.MethodFilter()
    band = django_filters.MethodFilter()

    class Meta:
        model = Product
        fields = ['id', 'prd_name', 'prd_display_name', 'prd_class', 'prd_filter', 'band', 'group', 'group_id', 'releases',
                  'tags', ]

    def filter_group(self, queryset, value):
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

    def filter_group_id(self, queryset, value):
        return queryset.filter(prd_class__pcl_group__pk=str(value))

    def filter_band(self, queryset, value):
        return queryset.filter(prd_filter__filter=str(value))


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
        fields = ['id', 'prd_name', 'prd_display_name', 'prd_class', 'group']

    def filter_group(self, queryset, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))


# Create your views here.
class CatalogViewSet(viewsets.ModelViewSet, mixins.UpdateModelMixin):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Catalog.objects.select_related().all()

    serializer_class = CatalogSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (filters.DjangoFilterBackend, ProductPermissionFilterBackend,)

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

        # Usando Filter_Queryset e aplicado os filtros listados no filterbackend
        queryset = self.filter_queryset(self.get_queryset())


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

            # O Catalogo e editavel se o usuario logado for = o owner do produto
            editable = False
            if row.prd_owner and request.user.pk == row.prd_owner.pk:
                editable = True


            # Adiciono os atributos que serao usados pela interface
            # esse dict vai ser um no filho de um dos nos de classe.
            catalog.update({
                "text": row.prd_display_name,
                "leaf": True,
                "iconCls": "no-icon",
                "starred": False,
                "markable": True,
                "editable": editable
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

    @list_route()
    def get_display_content(self, request):

        pcn_product_id = request.query_params.get('pcn_product_id', None)
        if pcn_product_id is None:
            raise Exception('pcn_product_id is required.')

        pca_setting = request.query_params.get('pca_setting', None)
        flag_content_settings = False

        if pca_setting is not None:
            # Se tiver alguma configuracao de setting
            if ProductContentSetting.objects.filter(pcs_setting=pca_setting).count():
                flag_content_settings = True


        qdisplay_name = request.query_params.get('display_name', None)

        queryset = ProductContent.objects.select_related().filter(pcn_product_id=pcn_product_id)

        contents = list()

        # Esse array define uma ordem padrao para as propriedades que podem ser associadas, sera usado caso nao tenha
        # uma configuracao para a coluna
        # ID, RA, Dec, Radius(Arcmin)
        ucds = list(["meta.id;meta.main", "pos.eq.ra;meta.main", "pos.eq.dec;meta.main", "phys.angSize;src"])

        default_order = 99999

        for row in queryset:

            contentSetting = None
            if flag_content_settings:
                # Recupera a configuracao feita para uma coluna em usando como filtro uma configuracao.
                contentSetting = row.productcontentsetting_set.all().filter(pcs_setting=pca_setting).first()


            association = row.productcontentassociation_set.first()

            content = dict({
                'id': row.pk,
                'product_id': row.pcn_product_id.pk,
                'column_name': row.pcn_column_name,

                'class_id': None,
                'category': None,
                'ucd': None,
                'unit': None,
                'reference': None,
                'mandatory': None,

                'display_name': row.pcn_column_name,

                'content_setting': None,
                'is_visible': True,
                'order': default_order
            })

            if flag_content_settings:
                content.update({'is_visible': False})


            if association is not None:

                # Adicionar ordem a uma propriedade associada caso nao tenha settings
                ucd = association.pca_class_content.pcc_ucd
                if ucd is not None:
                    if ucd not in ucds:
                        ucds.append(ucd)

                    order = ucds.index(ucd)

                else:
                    order = default_order

                content.update({
                    'class_id': association.pca_class_content.pk,
                    'display_name': association.pca_class_content.pcc_display_name,
                    'ucd': ucd,
                    'unit': association.pca_class_content.pcc_unit,
                    'reference': association.pca_class_content.pcc_reference,
                    'mandatory': association.pca_class_content.pcc_mandatory,

                    # Substitui o display name pelo nome da associacao
                    'display_name': association.pca_class_content.pcc_display_name,
                    'order': order
                })

                try:
                    content.update({
                        'category': association.pca_class_content.pcc_category.cct_name
                    })
                except:
                    pass

            if contentSetting is not None:
                content.update({
                    'setting_id': pca_setting,
                    'content_setting': contentSetting.pk,
                    'is_visible': contentSetting.pcs_is_visible,
                    'order': contentSetting.pcs_order,
                })

            if qdisplay_name is not None:
                if content.get('display_name').lower().find(qdisplay_name.lower()) is not -1:
                    contents.append(content)
            else:
                contents.append(content)

        ordered = sorted(contents, key=operator.itemgetter('order'))

        return Response(ordered)




class ProductContentAssociationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content Association to be viewed or edited
    """
    queryset = ProductContentAssociation.objects.select_related().all()

    serializer_class = ProductContentAssociationSerializer

    filter_fields = ('id', 'pca_product', 'pca_class_content', 'pca_product_content')

    ordering_fields = ('id',)


class ProductAssociationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content Association to be viewed or edited
    """
    queryset = ProductContentAssociation.objects.select_related().all()

    serializer_class = ProductAssociationSerializer

    filter_fields = ('id', 'pca_product', 'pca_class_content', 'pca_product_content',)

    ordering_fields = ('id',)



class MapViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Map to be viewed or edited
    """
    queryset = Map.objects.select_related().all()

    serializer_class = MapSerializer

    filter_fields = ('prd_name', 'prd_display_name', 'prd_class')

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    ordering_fields = ('id',)

class MaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Map to be viewed or edited
    """
    queryset = Mask.objects.select_related().all()

    serializer_class = MaskSerializer

    filter_fields = ('prd_name', 'prd_display_name', 'prd_class')

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    ordering_fields = ('id',)


class AllProductViewSet(viewsets.ModelViewSet):
    """
    
    """
    queryset = Product.objects.select_related().filter(prd_process_id__isnull = False)

    serializer_class = AllProductsSerializer

    search_fields = ('prd_name', 'prd_display_name')

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = ProductFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')


class ProductSettingBackend(filters.BaseFilterBackend):
    """
    Filtra somente os settings do usuario ou os marcados como publicos.
    """

    def filter_queryset(self, request, queryset, view):
        return queryset.filter(Q(owner=request.user) | Q(cst_is_public=True))


class ProductSettingViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product settings to be viewed or edited
    """
    queryset = ProductSetting.objects.select_related().all()

    serializer_class = ProductSettingSerializer

    filter_backends = (filters.DjangoFilterBackend, ProductSettingBackend)

    filter_fields = ('id', 'cst_product', 'cst_display_name', 'cst_description', 'cst_is_public')

    ordering_fields = ('id', 'cst_display_name',)


class CurrentSettingViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = CurrentSetting.objects.all()

    serializer_class = CurrentSettingSerializer

    filter_backends = (filters.DjangoFilterBackend, IsOwnerFilterBackend)

    filter_fields = ('id', 'cst_product', 'cst_setting',)

    ordering_fields = ('id', 'cst_display_name',)



class ProductContentSettingViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = ProductContentSetting.objects.all().order_by('pcs_order')

    serializer_class = ProductContentSettingSerializer

    filter_fields = ('id', 'pcs_content', 'pcs_setting',)

    ordering_fields = ('id', 'order',)

class CutoutJobViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = CutOutJob.objects.all()

    serializer_class = CutoutJobSerializer

    ordering_fields = ('id',)


class PermissionUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Permission.objects.select_related().filter(prm_user__isnull=False)

    serializer_class = PermissionUserSerializer

    filter_fields = ('prm_product',)

    ordering_fields = ('prm_user__username',)


class PermissionWorkgroupUserFilter(django_filters.FilterSet):
    product = django_filters.MethodFilter()

    class Meta:
        model = WorkgroupUser
        fields = ['id', 'wgu_workgroup', 'wgu_user', 'product',]

    def filter_product(self, queryset, value):
        workgroups = Workgroup.objects.filter(permission__prm_product=int(value))
        return queryset.filter(wgu_workgroup__in=workgroups)


class PermissionWorkgroupUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = PermissionWorkgroupUserSerializer

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = PermissionWorkgroupUserFilter

    ordering_fields = ('wgu_workgroup__wgp_workgroup', 'wgu_user__username',)


class PermissionViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Permission.objects.select_related().all()

    serializer_class = PermissionSerializer

    filter_fields = ('prm_product', 'prm_user', 'prm_workgroup')


class WorkgroupViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Workgroup.objects.select_related().all()

    serializer_class = WorkgroupSerializer

class WorkgroupUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = WorkgroupUserSerializer

    filter_fields = ('wgu_workgroup',)
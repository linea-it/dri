#!/usr/bin/env python
# -*- coding: utf-8 -*-
import operator

import django_filters
from common.filters import IsOwnerFilterBackend
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import HttpResponse
from product.tasks import export_target_by_filter
from rest_framework import filters
from rest_framework import mixins
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from product.importproduct import ImportTargetListCSV
from django.http import JsonResponse

from lib.CatalogDB import CatalogDB
from .filters import ProductPermissionFilterBackend
from .serializers import *
from .tasks import product_save_as
from .tasks import import_target_list

from .association import Association

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .viziercds import VizierCDS
from django_filters.rest_framework import DjangoFilterBackend


logger = logging.getLogger(__name__)


class ProductFilter(django_filters.FilterSet):
    group = django_filters.CharFilter(method='filter_group')
    group_id = django_filters.CharFilter(method='filter_group_id')
    band = django_filters.CharFilter(method='filter_band')
    class_name = django_filters.CharFilter(method='filter_class_name')
    process = django_filters.CharFilter(method='filter_process')
    release = django_filters.CharFilter(method='filter_release')

    class Meta:
        model = Product
        fields = ['id', 'prd_name', 'prd_display_name', 'prd_class', 'prd_filter', 'band', 'group', 'group_id',
                  'releases', 'tags', 'class_name', 'release', ]

    def filter_group(self, queryset, name, value):
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

    def filter_group_id(self, queryset, name, value):
        return queryset.filter(prd_class__pcl_group__pk=str(value))

    def filter_band(self, queryset, name, value):
        return queryset.filter(prd_filter__filter=str(value))

    def filter_class_name(self, queryset, name, value):
        return queryset.filter(prd_class__pcl_name=str(value))

    def filter_process(self, queryset, name, value):
        return queryset.filter(prd_process_id__epr_original_id=str(value))

    def filter_release(self, queryset, name, value):
        return queryset.filter(releases__id=int(value))


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Product.objects.select_related().all()

    serializer_class = ProductSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (DjangoFilterBackend,)

    filter_class = ProductFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')


class CatalogFilter(django_filters.FilterSet):
    group = django_filters.CharFilter(method='filter_group')
    group__in = django_filters.CharFilter(method='filter_group__in')
    release = django_filters.CharFilter(method='filter_release')

    class Meta:
        model = Product
        fields = ['id', 'prd_name', 'prd_display_name', 'prd_class', 'group', 'group__in', 'release']

    def filter_group(self, queryset, name, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

    def filter_group__in(self, queryset, name, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name__in=value.split(','))

    def filter_release(self, queryset, name, value):
        return queryset.filter(releases__id=int(value))


class CatalogViewSet(viewsets.ModelViewSet, mixins.UpdateModelMixin):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Catalog.objects.select_related().all()

    serializer_class = CatalogSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_backends = (DjangoFilterBackend, ProductPermissionFilterBackend,)

    filter_class = CatalogFilter

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class', 'prd_date', 'release_display_name')

    @action(detail=False)
    def get_class_tree_by_group(self, request):
        """
            Este metodo retorna uma tree, com todos os produtos de um grupo. estes produtos esto
            agrupados por suas classes.
             necessario o parametro group que  o internal name da tabela Group
            ex: catalog/get_class_tree_by_group/group='targets'
        """
        group = request.query_params.get('group', None)
        groupin = request.query_params.get('group__in', None)
        if not group and not groupin:
            # TODO retornar execpt que o group e obrigatorio
            return Response({
                'success': False,
                'msg': 'Necessario passar o parametro group.'
            })

        groups = None
        if groupin is not None:
            groups = groupin.split(',')

        # Usando Filter_Queryset e aplicado os filtros listados no filterbackend
        queryset = self.filter_queryset(self.get_queryset())

        # Search
        prd_display_name = request.query_params.get('search', None)
        if prd_display_name:
            queryset = self.queryset.filter(prd_display_name__icontains=prd_display_name)

        # Bookmark
        bookmarked = request.query_params.get('bookmark', None)
        if bookmarked:
            # Recuperar todos os catalogos marcados como favorito pelo usuario logado
            bookmarkeds = BookmarkProduct.objects.filter(owner=request.user.pk)
            if bookmarkeds.count() > 0:
                ids = bookmarkeds.values_list('product', flat=True)
                queryset = self.queryset.filter(pk__in=ids)

        # Caso tenha mais de um group passado por parametro o no principal sera o grupo
        nodeGroup = dict()

        # Esse dicionario vai receber os nos principais que sao as classes.
        classes = dict()

        # Instancia do banco de Catalogo
        catalog_db = CatalogDB()

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
                        "children": list(),
                        "pgr_name": str(row.prd_class.pcl_group.pgr_name),
                        "leaf": False,
                    })
                })

            # Cria um dict usando o Serializer setado neste Viewset
            catalog = self.get_serializer(row).data

            # O Catalogo e editavel se o usuario logado for = o owner do produto
            editable = False
            if row.prd_owner and request.user.pk == row.prd_owner.pk:
                editable = True

            # Checar se o Catalog Existe no Banco de Dados
            # TODO essa solucao e temporaria enquanto nao temos um garbage colector para apagar as tabelas
            # nao registradas.
            table_exist = False
            iconcls = 'x-fa fa-exclamation-triangle color-orange'
            try:
                if row.tbl_database == 'catalog' or row.tbl_database is None:
                    if catalog_db.table_exists(schema=row.tbl_schema, table=row.tbl_name):
                        iconcls = 'no-icon'
                        table_exist = True
                else:
                    iconcls = 'no-icon'
                    table_exist = True

            except Exception as e:
                print(e)
                pass

            # Adiciono os atributos que serao usados pela interface
            # esse dict vai ser um no filho de um dos nos de classe.
            catalog.update({
                "text": row.prd_display_name,
                "leaf": True,
                "iconCls": iconcls,
                "bookmark": None,
                "editable": editable,
                "tableExist": table_exist,
                "description": row.prd_description,
                "external_catalog": False
            })

            try:
                bookmark = BookmarkProduct.objects.get(product=row.id, owner=request.user.pk)
                catalog.update({
                    "bookmark": bookmark.pk,
                    "iconCls": "x-fa fa-star color-icon-starred",
                    "starred": True
                })

            except ObjectDoesNotExist:
                pass

            # pega o no da classe e adiciona este no de catalogo como filho.
            dclass = classes.get(class_name)
            dclass.get('children').append(catalog)

            if groups is not None:
                # Model Product Group
                productgroup = row.prd_class.pcl_group
                group_name = productgroup.pgr_name

                # Verifica se ja existe um no para esse grupo
                if nodeGroup.get(group_name) is None:
                    nodeGroup.update({
                        group_name: dict({
                            "text": str(productgroup.pgr_display_name),
                            "expanded": False,
                            "children": list()
                        })
                    })

        result = dict({
            'success': True,
            'expanded': True,
            'children': list()
        })

        # Se tiver mais de um grupo, as classes vao ficar como subdiretorio do grupo.
        external_catalogs_vizier = None
        if groups is not None:

            external_catalogs_vizier = self.get_external_catalogs()

            for class_name in classes:
                c = classes.get(class_name)
                group_name = c.get('pgr_name')

                if group_name in nodeGroup:
                    nodeGroup.get(group_name).get('children').append(c)

            for group_name in nodeGroup:

                nodeg = nodeGroup.get(group_name)

                # Se ja tiver o grupo External Catalog adiciona os catalogos do vizier como children
                if group_name == 'external_catalogs' and external_catalogs_vizier is not None:
                    nodeg['children'].append(external_catalogs_vizier.get('children')[0])

                result.get('children').append(nodeg)

            # Adiciona Catalogos Externos ex: Vizier
            if 'external_catalogs' in groups and 'external_catalogs' not in nodeGroup:
                result.get('children').append(external_catalogs_vizier)

        else:
            # Se tiver apenas um grupo basta retornar as classes
            for class_name in classes:
                result.get('children').append(classes.get(class_name))

        return Response(result)

    def get_external_catalogs(self):

        vizier_catalogs = VizierCDS().get_available_catalogs()

        vizier = dict({
            "text": "VizieR ",
            "expanded": False,
            "children": vizier_catalogs

        })

        external_catalogs = dict({
            "text": "External Catalogs",
            "expanded": False,
            "children": list([vizier])
        })

        return external_catalogs


class ProductContentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content to be viewed or edited
    """
    queryset = ProductContent.objects.select_related().all()

    serializer_class = ProductContentSerializer

    filter_fields = ('id', 'pcn_product_id', 'pcn_column_name',)

    ordering_fields = ('id', 'pcc_column_name',)

    @action(detail=False)
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

        queryset = ProductContent.objects.select_related().filter(
            pcn_product_id=pcn_product_id).order_by('pcn_column_name')

        contents = list()

        # Esse array define uma ordem padrao para as propriedades que podem ser associadas, sera usado caso nao tenha
        # uma configuracao para a coluna
        # ID, RA, Dec, Radius(Arcmin), a_image, b_image, theta_image, mags
        ucds = list(["meta.id;meta.main", "pos.eq.ra;meta.main", "pos.eq.dec;meta.main", "phys.angSize;src",
                     "phot.mag;meta.main;em.opt.g", "phot.mag;meta.main;em.opt.r", "phot.mag;meta.main;em.opt.i",
                     "phot.mag;meta.main;em.opt.z", "phot.mag;meta.main;em.opt.Y",
                     "phys.size.smajAxis;instr.det;meta.main", "phys.size.sminAxis;instr.det;meta.main",
                     "pos.posAng;instr.det;meta.main", ])

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


class ProductRelatedFilter(django_filters.FilterSet):
    prd_class = django_filters.CharFilter(method='filter_prd_class')

    class Meta:
        model = ProductRelated
        fields = ['prl_product', 'prl_related', 'prl_relation_type', 'prl_cross_identification', 'prd_class']

    def filter_prd_class(self, queryset, name, value):
        return queryset.filter(prl_related__prd_class__pcl_name=str(value))


class ProductRelatedViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = ProductRelated.objects.select_related().all()

    serializer_class = ProductRelatedSerializer

    filter_backends = (DjangoFilterBackend, )

    filter_class = ProductRelatedFilter


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

    @action(detail=False)
    def get_ucds_by_product(self, request):

        product_id = request.query_params.get('product_id', None)
        if product_id is None:
            raise Exception('product_id is required.')

        associations = Association().get_associations_by_product_id(product_id)

        return Response(associations)


class MapFilter(django_filters.FilterSet):
    release_id = django_filters.CharFilter(method='filter_release_id')
    release_name = django_filters.CharFilter(method='filter_release_name')
    with_image = django_filters.CharFilter(method='filter_with_image')

    class Meta:
        model = Map
        fields = ['id', 'prd_name', 'prd_display_name', 'prd_class']

    def filter_with_image(self, queryset, name, value):
        return queryset.filter(image__isnull=False)

    def filter_release_id(self, queryset, name, value):
        return queryset.filter(releases__id=value)

    def filter_release_name(self, queryset, name, value):
        return queryset.filter(releases__rls_name=value)


class MapViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Map to be viewed or edited
    """
    queryset = Map.objects.select_related().all().order_by(
        'prd_filter__lambda_mean')

    serializer_class = MapSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = MapFilter


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
    queryset = Product.objects.select_related().filter(prd_process_id__isnull=False)

    serializer_class = AllProductsSerializer

    search_fields = ('prd_name', 'prd_display_name')

    filter_backends = (DjangoFilterBackend,)

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

    filter_backends = (DjangoFilterBackend, ProductSettingBackend)

    filter_fields = ('id', 'cst_product', 'cst_display_name', 'cst_description', 'cst_is_public')

    ordering_fields = ('id', 'cst_display_name',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class CurrentSettingViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = CurrentSetting.objects.all()

    serializer_class = CurrentSettingSerializer

    filter_backends = (DjangoFilterBackend, IsOwnerFilterBackend)

    filter_fields = ('id', 'cst_product', 'cst_setting',)

    ordering_fields = ('id', 'cst_display_name',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


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
    queryset = CutOutJob.objects.all().order_by('-cjb_finish_time')

    serializer_class = CutoutJobSerializer

    filter_fields = ('id', 'cjb_product', 'cjb_display_name', 'cjb_status')

    ordering_fields = ('id', 'cjb_finish_time')

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class CutoutViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Cutout.objects.all()

    serializer_class = CutoutSerializer

    filter_fields = ('id', 'cjb_cutout_job', 'ctt_object_id', 'ctt_img_format', 'ctt_filter',)

    ordering_fields = ('id',)


class PermissionUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Permission.objects.select_related().filter(prm_user__isnull=False)

    serializer_class = PermissionUserSerializer

    filter_fields = ('prm_product',)

    ordering_fields = ('prm_user__username',)


class PermissionWorkgroupUserFilter(django_filters.FilterSet):
    product = django_filters.CharFilter(method='filter_product')

    class Meta:
        model = WorkgroupUser
        fields = ['id', 'wgu_workgroup', 'wgu_user', 'product', ]

    def filter_product(self, queryset, name, value):
        workgroups = Workgroup.objects.filter(permission__prm_product=int(value))
        return queryset.filter(wgu_workgroup__in=workgroups)


class PermissionWorkgroupUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = PermissionWorkgroupUserSerializer

    filter_backends = (DjangoFilterBackend,)

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

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class WorkgroupUserViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = WorkgroupUserSerializer

    filter_fields = ('wgu_workgroup',)


# ---------------------------------- Filtros ----------------------------------
class FiltersetViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = Filterset.objects.select_related().all()

    serializer_class = FiltersetSerializer

    filter_fields = ('id', 'product', 'owner', 'fst_name')

    filter_backends = (DjangoFilterBackend, IsOwnerFilterBackend)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class FilterConditionViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = FilterCondition.objects.select_related().all()

    serializer_class = FilterConditionSerializer

    filter_fields = ('id', 'filterset', 'fcd_property', 'fcd_operation', 'fcd_value')


# ---------------------------------- Bookmark ----------------------------------

class BookmarkedViewSet(viewsets.ModelViewSet):
    """

    """
    queryset = BookmarkProduct.objects.select_related().all()

    serializer_class = BookmarkedSerializer

    filter_fields = ('id', 'product', 'owner', 'is_starred')

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


# ---------------------------------- Export ----------------------------------
class ExportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Export a Product in file formats
    """
    http_method_names = ['post', ]

    authentication_classes = (SessionAuthentication, BasicAuthentication)

    permission_classes = (IsAuthenticated,)

    def create(self, request):
        data = request.data

        product_id = data.get("product", None)
        sfiletypes = data.get("filetypes")
        filetypes = sfiletypes.split(",")
        filter_id = data.get("filter", None)
        cutoutjob_id = data.get("cutout", None)

        if product_id is None:
            raise Exception("Product Id is mandatory")

        # Executar a Task Assincrona que fara o Export
        export_target_by_filter.delay(
            product_id,
            filetypes,
            request.user.pk,
            filter_id,
            cutoutjob_id
        )
        return HttpResponse(status=200)


# ---------------------------------- Save As ----------------------------------
class SaveAsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows save as a product
    """
    http_method_names = ['post', ]

    authentication_classes = (SessionAuthentication, BasicAuthentication)

    permission_classes = (IsAuthenticated,)

    def create(self, request):
        data = request.data

        product_id = data.get("product", None)
        name = data.get("name", None)
        description = data.get("description")
        filter_id = data.get("filter", None)

        if product_id is None:
            raise Exception("Product Id is mandatory")

        # Executar a Task Assincrona que fara o Save As
        product_save_as.delay(
            request.user.pk,
            product_id,
            name,
            filter_id,
            description
        )

        return HttpResponse(status=200)


# ---------------------------------- Import Target List ----------------------------------
class ImportTargetListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows upload a Target List Product
    """
    http_method_names = ['post', ]

    authentication_classes = (SessionAuthentication, BasicAuthentication)

    permission_classes = (IsAuthenticated,)

    def create(self, request):
        data = request.data

        try:

            product = ImportTargetListCSV().start_import(request.user.pk, data)

            return JsonResponse(dict({
                'success': True,
                'product': product.pk
            }))

        except Exception as e:
            return JsonResponse(dict({
                'success': False,
                'message': str(e)
            }), status=200)


# ------------------------------------- VisieR CDS Objects ----------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vizier_cds(request):
    if request.method == 'GET':
        """
         Faz uma requisicao ao servico Visier CDS e faz um parse do resultado que vem em csv para o 
         uma lista de dict como se fosse um produto do DRI.        

         """

        query_params = request.query_params

        rows = VizierCDS().get_objects(
            source=query_params.get("cds_source"),
            fieldnames=query_params.get("cds_fieldnames"),
            coordinates=[query_params.get("lat"), query_params.get("lng")],
            bounds=[query_params.get("dlat"), query_params.get("dlng")]
        )

        return Response(
            dict({
                "count": len(rows),
                "results": rows
            }))

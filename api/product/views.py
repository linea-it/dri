#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64
import logging
import operator
import shutil
import tarfile
import time
import zipfile

import django_filters
from common.filters import IsOwnerFilterBackend
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from lib.CatalogDB import CatalogDB
from rest_framework import filters, mixins, viewsets
from rest_framework.authentication import (
    BasicAuthentication,
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from product.importproduct import ImportTargetListCSV
from product.tasks import export_target_by_filter

from .association import Association
from .filters import ProductPermissionFilterBackend
from .serializers import *
from .tasks import import_target_list, product_save_as
from .viziercds import VizierCDS

from lib.CatalogDB import CatalogDB
import logging
from product_register.ImportProcess import Import
from product.models import Catalog



class ProductFilter(django_filters.FilterSet):
    group = django_filters.CharFilter(method="filter_group")
    group_id = django_filters.CharFilter(method="filter_group_id")
    band = django_filters.CharFilter(method="filter_band")
    class_name = django_filters.CharFilter(method="filter_class_name")
    process = django_filters.CharFilter(method="filter_process")
    release = django_filters.CharFilter(method="filter_release")

    class Meta:
        model = Product
        fields = [
            "id",
            "prd_name",
            "prd_display_name",
            "prd_class",
            "prd_filter",
            "band",
            "group",
            "group_id",
            "releases",
            "tags",
            "class_name",
            "release",
        ]

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

    search_fields = ("prd_name", "prd_display_name", "prd_class")

    filter_backends = (DjangoFilterBackend,)

    filterset_class = ProductFilter

    ordering_fields = ("id", "prd_name", "prd_display_name", "prd_class")


class CatalogFilter(django_filters.FilterSet):
    group = django_filters.CharFilter(method="filter_group")
    group__in = django_filters.CharFilter(method="filter_group__in")
    release = django_filters.CharFilter(method="filter_release")

    class Meta:
        model = Product
        fields = [
            "id",
            "prd_name",
            "prd_display_name",
            "prd_class",
            "group",
            "group__in",
            "release",
        ]

    def filter_group(self, queryset, name, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name=str(value))

    def filter_group__in(self, queryset, name, value):
        # product -> product_class -> product_group
        return queryset.filter(prd_class__pcl_group__pgr_name__in=value.split(","))

    def filter_release(self, queryset, name, value):
        return queryset.filter(releases__id=int(value))


class CatalogViewSet(viewsets.ModelViewSet, mixins.UpdateModelMixin):
    """
    API endpoint that allows product to be viewed or edited
    """

    authentication_classes = (
        SessionAuthentication,
        TokenAuthentication,
    )

    queryset = Catalog.objects.select_related().all()

    serializer_class = CatalogSerializer

    search_fields = ("prd_name", "prd_display_name", "prd_class")

    filter_backends = (
        DjangoFilterBackend,
        ProductPermissionFilterBackend,
    )

    filterset_class = CatalogFilter

    ordering_fields = (
        "id",
        "prd_name",
        "prd_display_name",
        "prd_class",
        "prd_date",
        "release_display_name",
    )

    @action(detail=False)
    def get_class_tree_by_group(self, request):
        """
        Este metodo retorna uma tree, com todos os produtos de um grupo. estes produtos esto
        agrupados por suas classes.
        necessario o parametro group que  o internal name da tabela Group
        ex: catalog/get_class_tree_by_group/group='targets'
        """

        group = request.query_params.get("group", None)
        groupin = request.query_params.get("group__in", None)
        if not group and not groupin:
            # TODO retornar execpt que o group e obrigatorio
            return Response(
                {"success": False, "msg": "Necessario passar o parametro group."}
            )

        groups = None
        if groupin is not None:
            groups = groupin.split(",")


        # Antes de iniciar a query, registra as tabelas do MYDB do usuario como catalogos de target.
        try:
            self.registry_mydb_tables(request.user)
        except Exception as e:
            return Response(
                {"success": False, "msg": e}
            )

        # Usando Filter_Queryset e aplicado os filtros listados no filterbackend
        queryset = self.filter_queryset(self.get_queryset())

        # Search
        prd_display_name = request.query_params.get("search", None)
        if prd_display_name:
            queryset = self.queryset.filter(
                prd_display_name__icontains=prd_display_name
            )

        # Bookmark
        bookmarked = request.query_params.get("bookmark", None)
        if bookmarked:
            # Recuperar todos os catalogos marcados como favorito pelo usuario logado
            bookmarkeds = BookmarkProduct.objects.filter(owner=request.user.pk)
            if bookmarkeds.count() > 0:
                ids = bookmarkeds.values_list("product", flat=True)
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

            # Não exibe catalogos que não pertencem ao mydb do usuario.
            if class_name == "mydb" and row.prd_owner != request.user:
                continue

            # Verifica se ja existe um no para essa classe
            # se nao existir cria um no e adiciona ao dict classes
            if classes.get(class_name) is None:
                classes.update(
                    {
                        class_name: dict(
                            {
                                "text": "%s" % row.prd_class.pcl_display_name,
                                "expanded": False,
                                "children": list(),
                                "pgr_name": str(row.prd_class.pcl_group.pgr_name),
                                "leaf": False,
                            }
                        )
                    }
                )

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
            iconcls = "x-fa fa-exclamation-triangle color-orange"
            try:
                if row.tbl_database == "catalog" or row.tbl_database is None:
                    if catalog_db.table_exists(
                        schema=row.tbl_schema, table=row.tbl_name
                    ):
                        iconcls = "no-icon"
                        table_exist = True
                else:
                    iconcls = "no-icon"
                    table_exist = True

            except Exception as e:
                print(e)
                pass

            # Adiciono os atributos que serao usados pela interface
            # esse dict vai ser um no filho de um dos nos de classe.
            catalog.update(
                {
                    "text": row.prd_display_name,
                    "leaf": True,
                    "iconCls": iconcls,
                    "bookmark": None,
                    "editable": editable,
                    "tableExist": table_exist,
                    "description": row.prd_description,
                    "external_catalog": False,
                }
            )

            try:
                bookmark = BookmarkProduct.objects.get(
                    product=row.id, owner=request.user.pk
                )
                catalog.update(
                    {
                        "bookmark": bookmark.pk,
                        "iconCls": "x-fa fa-star color-icon-starred",
                        "starred": True,
                    }
                )

            except ObjectDoesNotExist:
                pass

            # pega o no da classe e adiciona este no de catalogo como filho.
            dclass = classes.get(class_name)
            dclass.get("children").append(catalog)

            if groups is not None:
                # Model Product Group
                productgroup = row.prd_class.pcl_group
                group_name = productgroup.pgr_name

                # Verifica se ja existe um no para esse grupo
                if nodeGroup.get(group_name) is None:
                    nodeGroup.update(
                        {
                            group_name: dict(
                                {
                                    "text": str(productgroup.pgr_display_name),
                                    "expanded": False,
                                    "children": list(),
                                }
                            )
                        }
                    )

        result = dict({"success": True, "expanded": True, "children": list()})

        # Se tiver mais de um grupo, as classes vao ficar como subdiretorio do grupo.
        external_catalogs_vizier = None
        if groups is not None:

            external_catalogs_vizier = self.get_external_catalogs()

            for class_name in classes:
                c = classes.get(class_name)
                group_name = c.get("pgr_name")

                if group_name in nodeGroup:
                    nodeGroup.get(group_name).get("children").append(c)

            for group_name in nodeGroup:

                nodeg = nodeGroup.get(group_name)

                # Se ja tiver o grupo External Catalog adiciona os catalogos do vizier como children
                if (
                    group_name == "external_catalogs"
                    and external_catalogs_vizier is not None
                ):
                    nodeg["children"].append(
                        external_catalogs_vizier.get("children")[0]
                    )

                result.get("children").append(nodeg)

            # Adiciona Catalogos Externos ex: Vizier
            if "external_catalogs" in groups and "external_catalogs" not in nodeGroup:
                result.get("children").append(external_catalogs_vizier)

        else:
            # Se tiver apenas um grupo basta retornar as classes
            for class_name in classes:
                result.get("children").append(classes.get(class_name))

        return Response(result)

    def get_external_catalogs(self):

        vizier_catalogs = VizierCDS().get_available_catalogs()

        vizier = dict(
            {"text": "VizieR ", "expanded": False, "children": vizier_catalogs}
        )

        external_catalogs = dict(
            {"text": "External Catalogs", "expanded": False, "children": list([vizier])}
        )

        return external_catalogs


    def registry_mydb_tables(self, user):
        log = logging.getLogger("import_process")
        log.info("----------------- Registry Mydb Tables -------------------")
        log.info("Querying all tables in the user's Mydb.")
        try:
            db = CatalogDB(db="mydb")
            # Get mydb schema
            mydb_schema = user.profile.get_mydb_schema()
            log.info(f"User's Mydb: {mydb_schema}")
            # Check if schema exists
            schema_exists = db.schema_exists(schema=mydb_schema)
            log.info(f"Schema exists: {schema_exists}")
            # List all tables in schema
            tables_in_schema = db.get_table_names(schema=mydb_schema)
            log.info(f"User's Tables: {len(tables_in_schema)}")
            log.debug(tables_in_schema)

            # TODO: Necessário exportar o product classifier fixture

            # Check if tables are registered as products
            for tbl_name in tables_in_schema:
                try:
                    log.info(f"Check if Table {tbl_name} is already registered as product")
                    catalog = Catalog.objects.get(
                        prd_owner=user,
                        tbl_database="mydb",
                        tbl_schema=mydb_schema,
                        tbl_name=tbl_name
                    )
                    log.debug(catalog)
                    if catalog:
                        log.info(f"Table {catalog} is already registered as product id {catalog.id}")
                        continue
                except Catalog.DoesNotExist:
                    log.info(f"Table {tbl_name} is not registered as")

                    data = list([{
                        "process_id": None,
                        "name": f"{mydb_schema}_{tbl_name}",
                        "display_name": f"{mydb_schema}.{tbl_name}",
                        "database": "mydb",
                        "schema": mydb_schema,
                        "table": tbl_name,
                        "filter": None,
                        # "releases": None,
                        # "fields": None,
                        # "association": associations,
                        "type": "catalog",
                        "class": "mydb",
                        "description": None,
                        "is_public": False,
                        "is_permanent": False
                    }])

                    import_product = Import()

                    import_product.user = user
                    import_product.owner = user
                    import_product.site = None
                    import_product.process = None

                    new_product = import_product.import_products(data)

                    log.info(f"New product {new_product.id} - {new_product} created")

            log.info("Checking if all registered tables still exist in user's mydb.")
            catalogs = Catalog.objects.filter(prd_owner=user, tbl_database="mydb")
            for catalog in catalogs:
                if catalog.tbl_name not in tables_in_schema:
                    log.info(f"Table {catalog.tbl_name} is not in user's mydb anymore")
                    catalog.delete()
                    log.info(f"Catalog {catalog.id} - {catalog} deleted")
        except Exception as e:
            log.error(f"Error registering tables in user's mydb: {e}")

class ProductContentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content to be viewed or edited
    """

    queryset = ProductContent.objects.select_related().all()

    serializer_class = ProductContentSerializer

    filterset_fields = (
        "id",
        "pcn_product_id",
        "pcn_column_name",
    )

    ordering_fields = (
        "id",
        "pcc_column_name",
    )

    @action(detail=False)
    def get_display_content(self, request):

        pcn_product_id = request.query_params.get("pcn_product_id", None)
        if pcn_product_id is None:
            raise Exception("pcn_product_id is required.")

        pca_setting = request.query_params.get("pca_setting", None)
        flag_content_settings = False

        if pca_setting is not None:
            # Se tiver alguma configuracao de setting
            if ProductContentSetting.objects.filter(pcs_setting=pca_setting).count():
                flag_content_settings = True

        qdisplay_name = request.query_params.get("display_name", None)

        queryset = (
            ProductContent.objects.select_related()
            .filter(pcn_product_id=pcn_product_id)
            .order_by("pcn_column_name")
        )

        contents = list()

        # Esse array define uma ordem padrao para as propriedades que podem ser associadas, sera usado caso nao tenha
        # uma configuracao para a coluna
        # ID, RA, Dec, Radius(Arcmin), a_image, b_image, theta_image, mags
        ucds = list(
            [
                "meta.id;meta.main",
                "pos.eq.ra;meta.main",
                "pos.eq.dec;meta.main",
                "phys.angSize;src",
                "phot.mag;meta.main;em.opt.g",
                "phot.mag;meta.main;em.opt.r",
                "phot.mag;meta.main;em.opt.i",
                "phot.mag;meta.main;em.opt.z",
                "phot.mag;meta.main;em.opt.Y",
                "phys.size.smajAxis;instr.det;meta.main",
                "phys.size.sminAxis;instr.det;meta.main",
                "pos.posAng;instr.det;meta.main",
            ]
        )

        default_order = 99999

        for row in queryset:

            contentSetting = None
            if flag_content_settings:
                # Recupera a configuracao feita para uma coluna em usando como filtro uma configuracao.
                contentSetting = (
                    row.productcontentsetting_set.all()
                    .filter(pcs_setting=pca_setting)
                    .first()
                )

            association = row.productcontentassociation_set.first()

            content = dict(
                {
                    "id": row.pk,
                    "product_id": row.pcn_product_id.pk,
                    "column_name": row.pcn_column_name,
                    "class_id": None,
                    "category": None,
                    "ucd": None,
                    "unit": None,
                    "reference": None,
                    "mandatory": None,
                    "display_name": row.pcn_column_name,
                    "content_setting": None,
                    "is_visible": True,
                    "order": default_order,
                }
            )

            if flag_content_settings:
                content.update({"is_visible": False})

            if association is not None:

                # Adicionar ordem a uma propriedade associada caso nao tenha settings
                ucd = association.pca_class_content.pcc_ucd
                if ucd is not None:
                    if ucd not in ucds:
                        ucds.append(ucd)

                    order = ucds.index(ucd)

                else:
                    order = default_order

                content.update(
                    {
                        "class_id": association.pca_class_content.pk,
                        "ucd": ucd,
                        "unit": association.pca_class_content.pcc_unit,
                        "reference": association.pca_class_content.pcc_reference,
                        "mandatory": association.pca_class_content.pcc_mandatory,
                        # Substitui o display name pelo nome da associacao
                        "display_name": association.pca_class_content.pcc_display_name,
                        "order": order,
                    }
                )

                try:
                    content.update(
                        {
                            "category": association.pca_class_content.pcc_category.cct_name
                        }
                    )
                except:
                    pass

            if contentSetting is not None:
                content.update(
                    {
                        "setting_id": pca_setting,
                        "content_setting": contentSetting.pk,
                        "is_visible": contentSetting.pcs_is_visible,
                        "order": contentSetting.pcs_order,
                    }
                )

            if qdisplay_name is not None:
                if (
                    content.get("display_name").lower().find(qdisplay_name.lower())
                    != -1
                ):
                    contents.append(content)
            else:
                contents.append(content)

        ordered = sorted(contents, key=operator.itemgetter("order"))

        return Response(ordered)


class ProductRelatedFilter(django_filters.FilterSet):
    prd_class = django_filters.CharFilter(method="filter_prd_class")

    class Meta:
        model = ProductRelated
        fields = [
            "prl_product",
            "prl_related",
            "prl_relation_type",
            "prl_cross_identification",
            "prd_class",
        ]

    def filter_prd_class(self, queryset, name, value):
        return queryset.filter(prl_related__prd_class__pcl_name=str(value))


class ProductRelatedViewSet(viewsets.ModelViewSet):
    """ """

    queryset = ProductRelated.objects.select_related().all()

    serializer_class = ProductRelatedSerializer

    filter_backends = (DjangoFilterBackend,)

    filterset_class = ProductRelatedFilter


class ProductContentAssociationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content Association to be viewed or edited
    """

    queryset = ProductContentAssociation.objects.select_related().all()

    serializer_class = ProductContentAssociationSerializer

    filterset_fields = ("id", "pca_product", "pca_class_content", "pca_product_content")

    ordering_fields = ("id",)


class ProductAssociationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product content Association to be viewed or edited
    """

    queryset = ProductContentAssociation.objects.select_related().all()

    serializer_class = ProductAssociationSerializer

    filterset_fields = (
        "id",
        "pca_product",
        "pca_class_content",
        "pca_product_content",
    )

    ordering_fields = ("id",)

    @action(detail=False)
    def get_ucds_by_product(self, request):

        product_id = request.query_params.get("product_id", None)
        if product_id is None:
            raise Exception("product_id is required.")

        associations = Association().get_associations_by_product_id(product_id)

        return Response(associations)


class MapFilter(django_filters.FilterSet):
    release_id = django_filters.CharFilter(method="filter_release_id")
    release_name = django_filters.CharFilter(method="filter_release_name")
    with_image = django_filters.CharFilter(method="filter_with_image")

    class Meta:
        model = Map
        fields = ["id", "prd_name", "prd_display_name", "prd_class"]

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

    queryset = Map.objects.select_related().all().order_by("prd_filter__lambda_mean")

    serializer_class = MapSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = MapFilter


class MaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Map to be viewed or edited
    """

    queryset = Mask.objects.select_related().all()

    serializer_class = MaskSerializer

    filterset_fields = ("prd_name", "prd_display_name", "prd_class")

    search_fields = ("prd_name", "prd_display_name", "prd_class")

    ordering_fields = ("id",)


class AllProductViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Product.objects.select_related().filter(prd_process_id__isnull=False)

    serializer_class = AllProductsSerializer

    search_fields = ("prd_name", "prd_display_name")

    filter_backends = (DjangoFilterBackend,)

    filterset_class = ProductFilter

    ordering_fields = ("id", "prd_name", "prd_display_name", "prd_class")


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

    filterset_fields = (
        "id",
        "cst_product",
        "cst_display_name",
        "cst_description",
        "cst_is_public",
    )

    ordering_fields = (
        "id",
        "cst_display_name",
    )

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class CurrentSettingViewSet(viewsets.ModelViewSet):
    """ """

    queryset = CurrentSetting.objects.all()

    serializer_class = CurrentSettingSerializer

    filter_backends = (DjangoFilterBackend, IsOwnerFilterBackend)

    filterset_fields = (
        "id",
        "cst_product",
        "cst_setting",
    )

    ordering_fields = (
        "id",
        "cst_display_name",
    )

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class ProductContentSettingViewSet(viewsets.ModelViewSet):
    """ """

    queryset = ProductContentSetting.objects.all().order_by("pcs_order")

    serializer_class = ProductContentSettingSerializer

    filterset_fields = (
        "id",
        "pcs_content",
        "pcs_setting",
    )

    ordering_fields = (
        "id",
        "order",
    )


class CutoutJobViewSet(viewsets.ModelViewSet):
    """ """

    queryset = CutOutJob.objects.all().order_by("-cjb_finish_time")

    serializer_class = CutoutJobSerializer

    filterset_fields = ("id", "cjb_product", "cjb_display_name", "cjb_status")

    ordering_fields = ("id", "cjb_finish_time")

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class CutoutViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Cutout.objects.all()

    serializer_class = CutoutSerializer

    filterset_fields = (
        "id",
        "cjb_cutout_job",
        "ctt_object_id",
        "ctt_img_format",
        "ctt_filter",
    )

    ordering_fields = ("id",)


class PermissionUserViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Permission.objects.select_related().filter(prm_user__isnull=False)

    serializer_class = PermissionUserSerializer

    filterset_fields = ("prm_product",)

    ordering_fields = ("prm_user__username",)


class PermissionWorkgroupUserFilter(django_filters.FilterSet):
    product = django_filters.CharFilter(method="filter_product")

    class Meta:
        model = WorkgroupUser
        fields = [
            "id",
            "wgu_workgroup",
            "wgu_user",
            "product",
        ]

    def filter_product(self, queryset, name, value):
        workgroups = Workgroup.objects.filter(permission__prm_product=int(value))
        return queryset.filter(wgu_workgroup__in=workgroups)


class PermissionWorkgroupUserViewSet(viewsets.ModelViewSet):
    """ """

    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = PermissionWorkgroupUserSerializer

    filter_backends = (DjangoFilterBackend,)

    filterset_class = PermissionWorkgroupUserFilter

    ordering_fields = (
        "wgu_workgroup__wgp_workgroup",
        "wgu_user__username",
    )


class PermissionViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Permission.objects.select_related().all()

    serializer_class = PermissionSerializer

    filterset_fields = ("prm_product", "prm_user", "prm_workgroup")


class WorkgroupViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Workgroup.objects.select_related().all()

    serializer_class = WorkgroupSerializer

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class WorkgroupUserViewSet(viewsets.ModelViewSet):
    """ """

    queryset = WorkgroupUser.objects.select_related().all()

    serializer_class = WorkgroupUserSerializer

    filterset_fields = ("wgu_workgroup",)


# ---------------------------------- Filtros ----------------------------------
class FiltersetViewSet(viewsets.ModelViewSet):
    """ """

    queryset = Filterset.objects.select_related().all()

    serializer_class = FiltersetSerializer

    filterset_fields = ("id", "product", "owner", "fst_name")

    filter_backends = (DjangoFilterBackend, IsOwnerFilterBackend)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


class FilterConditionViewSet(viewsets.ModelViewSet):
    """ """

    queryset = FilterCondition.objects.select_related().all()

    serializer_class = FilterConditionSerializer

    filterset_fields = ("id", "filterset", "fcd_property", "fcd_operation", "fcd_value")


# ---------------------------------- Bookmark ----------------------------------


class BookmarkedViewSet(viewsets.ModelViewSet):
    """ """

    queryset = BookmarkProduct.objects.select_related().all()

    serializer_class = BookmarkedSerializer

    filterset_fields = ("id", "product", "owner", "is_starred")

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                "It is necessary an active login to perform this operation."
            )
        serializer.save(owner=self.request.user)


# ---------------------------------- Export ----------------------------------
class ExportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Export a Product in file formats
    """

    http_method_names = [
        "post",
    ]

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
            product_id, filetypes, request.user.pk, filter_id, cutoutjob_id
        )
        return HttpResponse(status=200)


# ---------------------------------- Save As ----------------------------------
class SaveAsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows save as a product
    """

    http_method_names = [
        "post",
    ]

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
        product_save_as.delay(request.user.pk, product_id, name, filter_id, description)

        return HttpResponse(status=200)


# ---------------------------------- Import Target List ----------------------------------
class ImportTargetListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows upload a Target List Product
    """

    http_method_names = [
        "post",
    ]

    authentication_classes = (
        SessionAuthentication,
        TokenAuthentication,
    )

    permission_classes = (IsAuthenticated,)

    def create(self, request):
        log = logging.getLogger("import_target_csv")

        log.info("--------------------------------------------------")
        log.info("Requesting CSV import.")

        data = request.data

        # Diretórios para armazenar os arquivos
        data_dir = settings.DATA_DIR
        data_tmp_dir = settings.DATA_TMP_DIR

        # Verificar o tipo de upload
        if data["mime"] == "csv":
            log.info("String import in csv format.")

            try:
                # Upload csv in string format.
                product = ImportTargetListCSV().start_import(request.user.pk, data)

                return JsonResponse({"success": True, "product": product.pk})

            except Exception as e:
                return JsonResponse(
                    dict({"success": False, "message": str(e)}), status=200
                )

        elif data["mime"] == "text/csv":
            # Arquivo csv convertido para string base64
            log.info("Importing a csv file in base64 string.")

            # Fazer o decode do arquivo base64
            if data["base64"]:
                try:
                    file_content = base64.b64decode(data["csvData"])
                    file_content = file_content.decode("utf-8")

                    log.debug(file_content[0:256] + "...")

                    data["csvData"] = file_content

                    product = ImportTargetListCSV().start_import(request.user.pk, data)

                    return JsonResponse({"success": True, "product": product.pk})

                except Exception as e:
                    log.error(e)
                    return JsonResponse(
                        dict({"success": False, "message": str(e)}), status=200
                    )

        elif data["mime"] == "application/zip":
            # Arquivo zip contendo csv convertido para string base64
            log.info("Importing a zip file in base64 string.")

            # Diretórios e nomes de arquivos temporarios que serão usados.
            basepath = os.path.join(data_dir, data_tmp_dir)
            unique_time = str(time.time())
            temp_dir_name = "target_import_csv_%s" % unique_time
            filename = "target_import_csv_%s.zip" % unique_time
            temp_path = os.path.join(basepath, temp_dir_name)
            temp_filepath = os.path.join(temp_path, filename)

            try:
                # Decode a string base64
                file_content = base64.b64decode(data["csvData"])

                # Criar um diretório unico para este import
                os.mkdir(temp_path)
                log.info("Created Temp directory: [%s]" % temp_path)

                # Escrever o arquivo zip no diretório tmp
                log.info("Creating temporary zip: [%s]" % temp_filepath)

                with open(temp_filepath, "wb") as result:
                    result.write(file_content)

                log.info("Zip file created!")

                # Extrair o arquivo zip
                with zipfile.ZipFile(temp_filepath, "r") as zip_ref:
                    zip_ref.extractall(temp_path)

                # Excluir o arquivo zip
                os.remove(temp_filepath)
                log.info("Removed zip file. [%s]" % temp_filepath)

                # Identificar os arquivos csvs no zip.
                csv_files = list(filter(lambda x: ".csv" in x, os.listdir(temp_path)))
                log.debug(csv_files)
                # Só é permitito 1 csv por zip.
                if len(csv_files) == 0:
                    raise Exception(
                        "No csv files were found in the zip. make sure you have only one compressed file with the extension .zip"
                    )
                if len(csv_files) > 1:
                    raise Exception(
                        "More than one csv file was found in the zip. make sure you have only one compressed file with the extension .zip"
                    )

                # Improtar o csv
                csv_file = os.path.join(temp_path, csv_files[0])

                # TODO: Será mais eficiente se a função de importação aceitar um arquivo ao inves de receber uma string.
                with open(csv_file, "r") as f:
                    csvData = f.read()

                log.debug(csvData[0:256] + "...")

                data["csvData"] = csvData
                product = ImportTargetListCSV().start_import(request.user.pk, data)

                # excluir os arquivos temp.
                shutil.rmtree(temp_path)
                log.info("Temporary directory has been removed.")

                return JsonResponse({"success": True, "product": product.pk})

            except Exception as e:
                log.error(e)
                # Caso de erro remove o diretório temporario.
                if os.path.exists(temp_path):
                    shutil.rmtree(temp_path)
                    log.info("Temporary directory has been removed.")

                return JsonResponse(
                    dict({"success": False, "message": str(e)}), status=200
                )

        elif data["mime"] == "application/gzip":
            # Arquivo tar.gz contendo csv convertido para string base64
            log.info("Importing a tar.gz file in base64 string.")

            # Diretórios e nomes de arquivos temporarios que serão usados.
            basepath = os.path.join(data_dir, data_tmp_dir)
            unique_time = str(time.time())
            temp_dir_name = "target_import_csv_%s" % unique_time
            filename = "target_import_csv_%s.tar.gz" % unique_time
            temp_path = os.path.join(basepath, temp_dir_name)
            temp_filepath = os.path.join(temp_path, filename)

            try:
                # Decode a string base64
                file_content = base64.b64decode(data["csvData"])

                # Criar um diretório unico para este import
                os.mkdir(temp_path)
                log.info("Created Temp directory: [%s]" % temp_path)

                # Escrever o arquivo tar.gz no diretório tmp
                log.info("Creating temporary tar.gz: [%s]" % temp_filepath)

                with open(temp_filepath, "wb") as result:
                    result.write(file_content)

                log.info("Tar.gz file created!")

                # Extrair o arquivo tar.gz
                with tarfile.open(temp_filepath, "r:gz") as tar_ref:
                    tar_ref.extractall(path=temp_path)

                # Excluir o arquivo tar.gz
                os.remove(temp_filepath)
                log.info("Removed tar.gz file. [%s]" % temp_filepath)

                # Identificar os arquivos csvs no zip.
                csv_files = list(filter(lambda x: ".csv" in x, os.listdir(temp_path)))
                log.debug(csv_files)
                # Só é permitito 1 csv por zip.
                if len(csv_files) == 0:
                    raise Exception(
                        "No csv files were found in the zip. make sure you have only one compressed file with the extension .zip"
                    )
                if len(csv_files) > 1:
                    raise Exception(
                        "More than one csv file was found in the zip. make sure you have only one compressed file with the extension .zip"
                    )

                # Improtar o csv
                csv_file = os.path.join(temp_path, csv_files[0])

                # TODO: Será mais eficiente se a função de importação aceitar um arquivo ao inves de receber uma string.
                with open(csv_file, "r") as f:
                    csvData = f.read()

                log.debug(csvData[0:256] + "...")

                data["csvData"] = csvData
                product = ImportTargetListCSV().start_import(request.user.pk, data)

                # excluir os arquivos temp.
                shutil.rmtree(temp_path)
                log.info("Temporary directory has been removed.")

                return JsonResponse({"success": True, "product": product.pk})

            except Exception as e:
                log.error(e)
                # Caso de erro remove o diretório temporario.
                if os.path.exists(temp_path):
                    shutil.rmtree(temp_path)
                    log.info("Temporary directory has been removed.")

                return JsonResponse(
                    dict({"success": False, "message": str(e)}), status=200
                )

        else:
            return JsonResponse(
                dict(
                    {
                        "success": False,
                        "message": "File type %s is not supported" % data["mime"],
                    }
                )
            )


# ------------------------------------- VisieR CDS Objects ----------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vizier_cds(request):
    if request.method == "GET":
        """
        Faz uma requisicao ao servico Visier CDS e faz um parse do resultado que vem em csv para o
        uma lista de dict como se fosse um produto do DRI.

        """

        query_params = request.query_params

        rows = VizierCDS().get_objects(
            source=query_params.get("cds_source"),
            fieldnames=query_params.get("cds_fieldnames"),
            coordinates=[query_params.get("lat"), query_params.get("lng")],
            bounds=[query_params.get("dlat"), query_params.get("dlng")],
        )

        return Response(dict({"count": len(rows), "results": rows}))

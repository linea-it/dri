from lib.CatalogDB import CatalogDB
from product.models import Catalog, ProductContent, ProductContentAssociation
from product.serializers import AssociationSerializer

from rest_framework import viewsets
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.viewsets import ViewSet
from .models import Rating, Reject, Comments
from .serializers import RatingSerializer, RejectSerializer, CommentsSerializer
from rest_framework.permissions import AllowAny
import csv

from .views_db import CoaddObjectsDBHelper, VisiomaticCoaddObjectsDBHelper, TargetViewSetDBHelper, TestViewSetDBHelper


class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Rating to be viewed or edited
    """
    queryset = Rating.objects.all()

    serializer_class = RatingSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'rating')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.pk)


class RejectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Reject to be viewed or edited
    """
    queryset = Reject.objects.all()

    serializer_class = RejectSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'reject')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user.pk)


class CommentsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Comments to be viewed or edited
    """
    queryset = Comments.objects.all()

    serializer_class = CommentsSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'comments')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user.pk)


class TargetViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of targets in catalog.
        """

        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        db_helper = TargetViewSetDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database)

        # colunas associadas ao produto
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()

        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({
                    property.get('pcc_ucd'): property.get('pcn_column_name').lower()
                })

        rows, count = db_helper.query_result(request, properties)

        for row in rows:
            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
                "_meta_rating_id": None,
                "_meta_rating": None,
                "_meta_reject_id": None,
                "_meta_reject": False,
            })

            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main")),
                "_meta_property_id": properties.get("meta.id;meta.main")
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main")),
                "_meta_property_ra": properties.get("pos.eq.ra;meta.main")
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main")),
                "_meta_property_dec": properties.get("pos.eq.dec;meta.main")
            })
            row.update({
                "_meta_radius": row.get(properties.get("phys.angSize;src")),
                "_meta_property_radius": properties.get("phys.angSize;src")
            })

            row.update({
                "_meta_rating_id": row.get('meta_rating_id', None)
            })
            row.update({
                "_meta_rating": row.get('meta_rating', None)
            })
            row.update({
                "_meta_reject_id": row.get('meta_reject_id', None)
            })
            row.update({
                "_meta_reject": bool(row.get('meta_reject', False))
            })

            row.pop("meta_rating_id", None)
            row.pop("meta_rating", None)
            row.pop("meta_reject_id", None)
            row.pop("meta_reject", None)

            # Count de Comentarios por objetos.
            # TODO: utlizar um join com having count ao inves de uma query para cada linha

            try:
                comments = Comments.objects.filter(
                    catalog_id=catalog.pk, object_id=row.get("_meta_id"))

                row.update({
                    "_meta_comments": comments.count()
                })

            except:
                row.update({
                    "_meta_comments": None
                })

        return Response(dict({
            'count': count,
            'results': rows
        }))


class VisiomaticCoaddObjects(ViewSet):
    """

    """

    # permission_classes = (AllowAny,)

    def list(self, request):
        """
        Return a list of coadd objects for visiomatic.
        """
        # Recuperar o parametro product id ou sorce e obrigatorio
        product_id = request.query_params.get('product', None)
        source = request.query_params.get('source', None)
        if product_id is not None:
            # Recuperar no model Catalog pelo id passado na url
            catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        elif source is not None:
            catalog = Catalog.objects.select_related().get(prd_name=source)
        else:
            raise Exception('Product id or source is mandatory.')

        if not catalog:
            raise Exception('No product found.')

        db_helper = VisiomaticCoaddObjectsDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database)

        rows = db_helper.query_result(request.query_params)
        cols = db_helper.str_columns
        # Parametros de Retorno
        mime = request.query_params.get('mime', 'json')
        if mime == 'json':
            return Response(rows)

        elif mime == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'inline'

            writer = csv.writer(response)
            for row in rows:
                r = list()
                for col in cols:
                    value = row.get(col)
                    if isinstance(value, float):
                        value = float(format(value, '.4f'))
                    r.append(value)

                # print(r)
                writer.writerow(r)

            return response

        else:
            pass


class CoaddObjects(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of coadd objects.
        """
        # Recuperar o parametro product id ou sorce e obrigatorio
        product_id = request.query_params.get('product', None)
        source = request.query_params.get('source', None)

        if product_id is not None:
            # Recuperar no model Catalog pelo id passado na url
            catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        elif source is not None:
            catalog = Catalog.objects.select_related().get(prd_name=source)
        else:
            raise Exception('Product id or source is mandatory.')

        if not catalog:
            raise Exception('No product found.')

        db_helper = CoaddObjectsDBHelper(catalog.tbl_name,
                                         schema=catalog.tbl_schema,
                                         database=catalog.tbl_database)

        # Antes de criar os filtros para a query verificar se o catalogo tem associacao e descobrir as
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=catalog.pk)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()

        # propriedades corretas
        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name').lower()})

        rows = db_helper.query_result(request.query_params, properties)
        for row in rows:
            print(row)
            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main"))
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            })

        return Response(rows)

class TestViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of targets in catalog.
        """

        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        db_helper = TestViewSetDBHelper(
            catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database)

        # colunas associadas ao produto
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()

        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({
                    property.get('pcc_ucd'): property.get('pcn_column_name').lower()
                })

        rows, count = db_helper.query_result(request, properties)

        for row in rows:
            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0
            })

            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main")),
                "_meta_property_id": properties.get("meta.id;meta.main")
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main")),
                "_meta_property_ra": properties.get("pos.eq.ra;meta.main")
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main")),
                "_meta_property_dec": properties.get("pos.eq.dec;meta.main")
            })
            row.update({
                "_meta_radius": row.get(properties.get("phys.angSize;src")),
                "_meta_property_radius": properties.get("phys.angSize;src")
            })

        return Response(dict({
            'count': count,
            'results': rows
        }))

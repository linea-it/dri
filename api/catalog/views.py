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

from .views_db import CoaddObjectsDBHelper, VisiomaticCoaddObjectsDBHelper

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

        print("TARGETVIEWSET")
        print(request.query_params)
        print("###########################")
        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        db_helper = VisiomaticCoaddObjectsDBHelper(
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
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        # Todas as colunas de catalogo.
        columns = list()
        queryset = ProductContent.objects.filter(pcn_product_id=catalog)
        for row in queryset:
            columns.append(row.pcn_column_name)

        rows = db_helper._create_stm(request.query_params, properties. columns)

        # retornar uma lista com os objetos da tabela
        rows = list()

        owner = request.user.pk

        rows, count = db.wrapper.query(
            table,
            limit=limit,
            offset=start,
            order_by=ordering,
            joins=list([dict({
                'operation': 'LEFT',
                'tablename': 'catalog_rating',
                'alias': 'b',
                'condition': 'a.%s = b.object_id AND b.owner = %s  AND b.catalog_id = %s' % (
                    property_id, owner, product_id),
                'columns': list(['id meta_rating_id', 'rating meta_rating'])
            }), dict({
                'operation': 'LEFT',
                'tablename': 'catalog_reject',
                'alias': 'c',
                'condition': 'a.%s = c.object_id AND c.owner = %s  AND c.catalog_id = %s' % (
                    property_id, owner, product_id),
                'columns': list(['id meta_reject_id', 'reject meta_reject'])
            })]),
            filters=filters
        )

        for row in rows:

            if 'META_RATING_ID' in row:
                rating_id = row.get('META_RATING_ID')
                rating = row.get('META_RATING')
                reject_id = row.get('META_REJECT_ID', 0)
                reject = row.get('META_REJECT', False)
            elif 'meta_rating_id' in row:
                rating_id = row.get('meta_rating_id')
                rating = row.get('meta_rating')
                reject_id = row.get('meta_reject_id', 0)
                reject = row.get('meta_reject', False)
            else:
                rating_id = None
                rating = None
                reject_id = None
                reject = None

            if reject_id is not None:
                reject_id = int(reject_id)
                reject = True
            else:
                reject = False

            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
                "_meta_rating_id": rating_id,
                "_meta_rating": rating,
                "_meta_reject_id": reject_id,
                "_meta_reject": reject,
            })

            row.pop("META_RATING_ID", None)
            row.pop("meta_rating_id", None)
            row.pop("META_RATING", None)
            row.pop("meta_rating", None)
            row.pop("META_REJECT_ID", None)
            row.pop("meta_reject_id", None)
            row.pop("META_REJECT", None)
            row.pop("meta_reject", None)

            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main"))
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            })
            row.update({
                "_meta_radius": row.get(properties.get("phys.angSize;src"))
            })
            row.update({
                "_meta_comments": None
            })

            # Count de Comentarios por objetos.
            # TODO: utlizar um join com having count ao inves de uma query para cada linha

            count2 = db.wrapper.fetchone("SELECT COUNT(*) FROM catalog_comments WHERE CATALOG_ID=%s AND OBJECT_ID=%s",
                                         [catalog.pk, row.get("_meta_id")])[0]
            count2 = int(count2)

            if count2 is not 0:
                row.update({
                    "_meta_comments": count2
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
                for col in columns:
                    value = row.get(col)
                    if isinstance(value, float):
                        value = float(format(value, '.4f'))
                    r.append(value)

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
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        rows = db_helper.query_result(request.query_params, properties)
        for row in rows:
            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main").lower())
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main").lower())
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main").lower())
            })

        return Response(rows)

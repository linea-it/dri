from lib.CatalogDB import CatalogDB
from product.models import Catalog, ProductContent, ProductContentAssociation
from product.serializers import AssociationSerializer

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from .models import Rating, Reject
from .serializers import RatingSerializer, RejectSerializer


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

        print('------------------------------------------------------------')
        print('Product Id: %s' % product_id)

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        db = CatalogDB()

        # Com o modelo catalog em maos deve ter um atributo para schema e tabela esses atributos estao descritos no
        # model table.
        schema = catalog.tbl_schema
        table = catalog.tbl_name
        tablename = table

        if schema:
            tablename = "%s.%s" % (schema, table)

        # colunas associadas ao produto
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()

        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        property_id = properties.get("meta.id;meta.main", None)

        # Todas as colunas de catalogo.
        columns = list()
        queryset = ProductContent.objects.all()
        for row in queryset:
            columns.append(row.pcn_column_name)
        sColumns = ", ".join(columns)


        # Parametros de Paginacao
        limit = request.query_params.get('limit', None)
        start = request.query_params.get('offset', None)
        end = start + limit


        # Parametros de Ordenacao
        # ordering = db.wrapper.do_order(request.query_params.get('ordering', 'rn'), columns)
        ordering = request.query_params.get('ordering', None)

        # retornar uma lista com os objetos da tabela
        rows = list()

        owner = request.user.pk

        # sql = (
        #     "SELECT * "
        #     "FROM ( "
        #         "SELECT /*+ first_rows(%s) */ "
        #         "%s, b.id rating_id, b.rating rating,"
        #         "row_number() "
        #         "OVER (ORDER BY %s) rn "
        #         "FROM tom_strong_lensing a "
        #         "LEFT JOIN catalog_rating b "
        #         "ON (a.%s = b.object_id AND b.owner = %s  AND b.catalog_id = %s) "
        #     ") "
        #
        #     "WHERE rn BETWEEN %s and %s "
        #     "%s "
        # ) % (limit, sColumns, property_id, property_id, owner, product_id, start, end, ordering)

        # print("---------------------------")
        # sql = "SELECT * FROM (SELECT /*+ first_rows(25) */ a.NAME_, a.DEC, a.RA, a.ID_AUTO, a.TILENAME, b.id rating_id, b.rating rating, row_number() OVER (ORDER BY a.ID_AUTO) rn FROM tom_strong_lensing a LEFT JOIN catalog_rating b ON (a.ID_AUTO = b.object_id AND b.owner = 3  AND b.catalog_id = 2)   ) WHERE rn BETWEEN 0 and 25"
        # rows = db.wrapper.fetchall_dict(sql)
        # print("---------------------------")

        rows, count = db.wrapper.query(
            table,
            limit=limit,
            offset=start,
            order_by=ordering,
            joins = list([dict({
                'operation': 'LEFT',
                'tablename': 'catalog_rating',
                'alias': 'b',
                'condition': 'a.%s = b.object_id AND b.owner = %s  AND b.catalog_id = %s' % (property_id, owner, product_id),
                'columns': list(['id meta_rating_id', 'rating meta_rating'])
            })])
        )


        for row in rows:

            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
                "_meta_rating_id": row.get('META_RATING_ID'),
                "_meta_rating": row.get('META_RATING'),
                "_meta_reject_id": 0,
                "_meta_reject": False
            })

            row.pop("META_RATING_ID", None)
            row.pop("META_RATING", None)

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

        return Response(dict({
            'count': count,
            'results': rows
        }))

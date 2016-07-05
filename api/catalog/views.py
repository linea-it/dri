from lib.CatalogDB import CatalogDB
from product.models import Catalog

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

class ObjectsViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of all users.
        """
        # Recuperar o parametro product id que e obrigatorio

        product_id = request.query_params.get('product', None)
        if not product_id:
            # TODO retornar mensagem de que o paramtro e obrigatorio
            pass

        print('------------------------------------------------------------')
        print('Product Id: %s' % product_id)

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        print(catalog)
        if not catalog:
            # TODO retornar mensagem de nenhum catalogo encontrado
            pass

        # Com o modelo catalog em maos deve ter um atributo para schema e tabela esses atributos estao descritos no
        # model table.
        schema = catalog.tbl_name
        table = catalog.tbl_schema

        print('Schema: %s' % schema)
        print('Table: %s' % table)

        # # com o produto descobrir as colunas do produto usar o model product_content.
        # mColumns = ProductContent.objects.select_related().filter(pcn_product_id=product_id)
        # columns = list()
        # for col in mColumns:
        #     columns.append(col.pcn_column_name)
        #
        # print('Columns: %s' % columns)

        # Parametros de Paginacao
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', None)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # usar a funcao que executa a query no banco do oracle nesse momento vc ja tem os parametros schema, table e colums
        #  os demais parametros vamos usar depois.

        # retornar uma lista com os objetos da tabela
        rows = list()


        db = CatalogDB()

        # rows = db.fetchall_dict('SELECT * FROM tom_strong_lensing WHERE ROWNUM < 5')
        # rows, count = db.query(
        #     'tom_strong_lensing',
        # #     # columns=['RA', 'DEC'],
        # #     limit=limit,
        # #     offset=offset
        # )

        print(rows)
        # print(count)

        # recuperar as colunas de uma tabela
        # print(db.wrapper.get_table_columns('tom_strong_lensing'))

        # "ID_AUTO": "13251",
        # "TILENAME": "DES2154-5414",
        # "NAME_": NaN,
        # "DEC": -54.1354,
        # "RATING": NaN,
        # "RA": 328.296

        # Placeholder objeto de exemplo
        obj = dict({
            "_meta_id": 13251,
            "_meta_catalog_id": 2,
            "_meta_ra": 328.296,
            "_meta_dec": -54.1354,
            "_meta_radius": 0,
            "_meta_is_system": False,
            "ID_AUTO": 13251,
            "NAME_": 1983,
            "RA": 328.296,
            "DEC": -54.1354,
            "TILENAME ": 'DES2154-5414',
            "rating_id": 0,
            "rating": None,
            "reject": False
        })

        rows.append(obj)

        count = len(rows)

        return Response(dict({
            'count': count,
            'results': rows
        }))


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

        print(catalog)
        if not catalog:
            raise Exception('No product found for this id.')

        # Com o modelo catalog em maos deve ter um atributo para schema e tabela esses atributos estao descritos no
        # model table.
        schema = catalog.tbl_name
        table = catalog.tbl_schema

        print('Schema: %s' % schema)
        print('Table: %s' % table)

        # # com o produto descobrir as colunas do produto usar o model product_content.
        # mColumns = ProductContent.objects.select_related().filter(pcn_product_id=product_id)
        # columns = list()
        # for col in mColumns:
        #     columns.append(col.pcn_column_name)
        #
        # print('Columns: %s' % columns)

        # Parametros de Paginacao
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', None)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # usar a funcao que executa a query no banco do oracle nesse momento vc ja tem os parametros schema, table e colums
        #  os demais parametros vamos usar depois.

        # retornar uma lista com os objetos da tabela
        rows = list()

        db = CatalogDB()

        rows = db.wrapper.fetchall_dict('SELECT * FROM tom_strong_lensing WHERE ROWNUM < 5')
        # rows, count = db.query(
        #     'tom_strong_lensing',
        # #     # columns=['RA', 'DEC'],
        # #     limit=limit,
        # #     offset=offset
        # )

        print(rows)
        # print(count)

        for row in rows:
            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
                "_meta_rating_id": 0,
                "_meta_rating": None,
                "_meta_reject": False
            })

            # # Placeholder objeto de exemplo
            # obj = dict({
            #     "_meta_id": 13251,
            #     "_meta_catalog_id": 2,
            #     "_meta_ra": 328.296,
            #     "_meta_dec": -54.1354,
            #     "_meta_radius": 0,
            #     "_meta_is_system": False,
            #     "ID_AUTO": 13251,
            #     "NAME_": 1983,
            #     "RA": 328.296,
            #     "DEC": -54.1354,
            #     "TILENAME ": 'DES2154-5414',
            #     "rating_id": 0,
            #     "rating": None,
            #     "reject": False
            # })

        # rows.append(obj)

        count = len(rows)

        return Response(dict({
            'count': count,
            'results': rows
        }))

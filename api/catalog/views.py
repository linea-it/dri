
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from .models import Rating
from .serializers import RatingSerializer
from product.models import Catalog, ProductContent
from lib.CatalogDB import CatalogDB

class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Rating to be viewed or edited
    """
    queryset = Rating.objects.all()

    serializer_class = RatingSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'rating')

    ordering_fields = ('id',)



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

        # rows = db.fetchall_dict('SELECT * FROM target_teste;')
        rows, count = db.query(
            'readmapper_y1a1',
            # columns=['RA', 'DEC'],
            limit=limit,
            offset=offset
        )

        print(rows)
        print(count)

        print('--------------------------')

        # recuperar as colunas de uma tabela
        # print(c.get_table_columns('target_teste'))


        # Placeholder objeto de exemplo
        # obj = dict({
        #     "_meta_id": 4397,
        #     "_meta_catalog_id": 1944,
        #     "_meta_ra": 0.53667891025543202,
        #     "_meta_dec": -0.33503088355064398,
        #     "_meta_radius": 70.585837680639102,
        #     "_meta_is_system": True,
        #     "id_auto": 4397,
        #     "id": 1983,
        #     "ra": 0.53667891025543202,
        #     "dec": -0.33503088355064398,
        #     "radius_arcsec_zm ": 70.585837680639102
        # })
        #
        # rows.append(obj)

        return Response(dict({
            'count': count,
            'results': rows
        }))
from product.models import Catalog, ProductContent

from rest_framework.response import Response
from rest_framework.viewsets import ViewSet


class CatalogObjectsViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of all users.
        """
        # Recuperar o pa
        # rametro product id que e obrigatorio

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

        # com o produto descobrir as colunas do produto usar o model product_content.
        mColumns = ProductContent.objects.select_related().filter(pcn_product_id=product_id)
        columns = list()
        for col in mColumns:
            columns.append(col.pcn_column_name)

        print('Columns: %s' % columns)

        # Parametros de Paginacao
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', None)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # usar a funcao que executa a query no banco do oracle nesse momento vc ja tem os parametros schema, table e colums
        #  os demais parametros vamos usar depois.

        # retornar uma lista com os objetos da tabela
        rows = list()

        return Response(dict({
            'count': 0,
            'results': rows
        }))

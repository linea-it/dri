from rest_framework.response import Response
from rest_framework.viewsets import ViewSet


class CatalogObjectsViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of all users.
        """
        # Recuperar o parametro product id que e obrigatorio

        product = request.query_params.get('product', None)
        if not product:
            # TODO retornar mensagem de que o paramtro e obrigatorio
            pass

        print('------------------------------------------------------------')
        print('Product Id: %s' % product)

        # Recuperar no model Product pelo id passado na url

        # Com o modelo product em maos deve ter um atributo para schema e tabela esses atributos estao descritos no
        # model table.

        # com o produto descobrir as colunas do produto usar o model product_content.

        # usar a funcao que executa a query no banco do oracle nesse momento vc ja tem os parametros schema, table e colums
        #  os demais parametros vamos usar depois.

        # retornar uma lista com os objetos da tabela
        rows = list()

        return Response(dict({
            'count': 0,
            'results': rows
        }))

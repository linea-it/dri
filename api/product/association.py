from .models import ProductContentAssociation, ProductContent
from .serializers import AssociationSerializer


class Association:
    def get_properties_associated(self, product_id):
        """
        Retorna uma lista com todas as propriedades que foram associadas.

        :param product_id:
        :return: list(["property1", "property2", ....])
        """

        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = list()

        for associate in associations:
            properties.append(associate.get('pcn_column_name').lower())

        return properties

    def get_associations_by_product_id(self, product_id):
        """
        Retorna um dict com as propriedades que possuem associacao.
        para um dado produto.
        esse dict e formado por uma chave que e o ucd e o valor e o nome da coluna.
        :param product_id:
        :return: dict({
            <ucd>:<product_content>,
            <ucd>:<product_content>,
            <ucd>:<product_content>...
        })
        """
        properties = dict()
        contents = ProductContent.objects.filter(pcn_product_id=product_id)
        for pcontent in contents:
            if pcontent.pcn_ucd is not None and pcontent.pcn_column_name is not None:
                properties.update({
                    pcontent.pcn_ucd: pcontent.pcn_column_name.lower()
                })

        # TODO Modelo antigo pode ser removido futuramente.
        # colunas associadas ao produto utilizando o metodo antigo de associacao por classe
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        for associate in associations:
            if associate.get('pcc_ucd'):
                properties.update({
                    associate.get('pcc_ucd'): associate.get('pcn_column_name').lower()
                })


        return properties

    def get_association_list_by_product_id(self, product_id):
        """
        Retorna uma lista com as propriedades que possuem associacao para um dado produto.
        essa lista e formada por dicts contendo 2 chaves o ucd e property que o nome da coluna
        associada.

        :param product_id:
        :return: list([
            dict({
                "ucd": <ucd da propriedade>,
                "property: <product_content>
            })
        ])
        """

        properties = list()

        contents = ProductContent.objects.filter(pcn_product_id=product_id)
        for pcontent in contents:
            if pcontent.pcn_ucd is not None and pcontent.pcn_column_name is not None:
                properties.append(dict({
                    "ucd": pcontent.pcn_ucd,
                    "property": pcontent.pcn_column_name.lower()
                }))


        # TODO Modelo antigo pode ser removido futuramente.
        # colunas associadas ao produto utilizando o metodo antigo de associacao por classe
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data

        for associate in associations:
            if associate.get('pcc_ucd'):
                properties.append(dict({
                    "ucd": associate.get('pcc_ucd'),
                    "property": associate.get('pcn_column_name').lower()
                }))

        return properties

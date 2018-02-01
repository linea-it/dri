import logging

from product_register.ImportProcess import Import
from product.models import Table as ProductTable
from userquery.models import Table

class TargetViewer:
    
    @staticmethod
    def register(user, table_pk, release_name, description=None):
        """ register table im target viewer """

        logger = logging.getLogger('register_table_in_the_target_viewer')
        logger.info("Register the new table as a product")

        table = Table.objects.get(pk=table_pk)

        # Dados para o registro
        data = list([{
            "process_id": None,
            "name": table.table_name,
            "display_name": table.display_name,
            "database": 'catalog',
            "schema": table.schema,
            "table": table.table_name,
            "filter": [],
            # review
            "releases": [release_name],
            "fields": [],
            "association": [],
            "type": "catalog",
            "class": "objects",
            "description": description
        }])

        logger.debug("Register Data")
        logger.debug(data)

        # Registar o novo produto
        import_product = Import()

        import_product.user = user
        import_product.owner = user
        import_product.site = None
        import_product.process = None

        import_product.import_products(data)

        product = Product.objects.get(
            prd_display_name=table.display_name,
            table__tbl_name=table.table_name,
            table__tbl_schema=table.schema,
            table__tbl_database='catalog'
        )

        table.product = product
        table.save()

        logger.info("New Product -id %s- was Registered" % product.pk)

    @staticmethod
    def unregister(product_id):
        """ uregister table im target viewer """

        logger = logging.getLogger('uregister_table_in_the_target_viewer')
        logger.info("Unregister the new table as a product")

        product = ProductTable.objects.get(product_ptr_id=product_id)
        product.delete()
        
        logger.info("Product -id %s- was Registered" % product_id)

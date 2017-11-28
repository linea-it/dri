import logging

from product_register.ImportProcess import Import


def register_table_in_the_target_viewer(user, schema, table_name, display_name, description=None):
    logger = logging.getLogger('register_table_in_the_target_viewer')
    logger.info("Register the new table as a product")

    # Dados para o registro
    data = list([{
        "process_id": None,
        "name": table_name,
        "display_name": display_name,
        "database": 'catalog',
        "schema": schema,
        "table": table_name,
        "filter": [],
        # review
        "releases": [],
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

    logger.info("New Product as Registered")

import logging
import os
from urllib.parse import urljoin

import pandas as pd
from common.notify import Notify
from django.conf import settings
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from lib.CatalogDB import CatalogDB, TargetObjectsDBHelper
from product_register.ImportProcess import Import

from .association import Association
from .models import FilterCondition, Product
from .serializers import FConditionSerializer


class SaveAs:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger('product_saveas')

    def parse_name(self, name):

        return name.lower().replace(" ", "_").strip()

    def create_table_by_product_id(self, user_id, product_id, name, filter_id, description):

        # Recuperar o produto
        try:
            product = Product.objects.get(pk=int(product_id))
            self.logger.debug("Origin Product: %s" % product.prd_display_name)

        except Product.DoesNotExist as e:
            self.logger.error("Product matching query does not exist. Product Id: %s" % product_id)

        user = User.objects.get(pk=user_id)

        self.notify_user_start(user, name)

        # Nome da tabela a ser criada
        tablename = self.parse_name(name)
        self.logger.debug("Tablename: %s" % tablename)

        # Filter Conditions
        conditions = list()
        if filter_id is not None and filter_id is not "":
            queryset = FilterCondition.objects.filter(filterset=int(filter_id))

            for row in queryset:
                serializer = FConditionSerializer(row)
                conditions.append(serializer.data)

        self.logger.debug("Filter Conditions: %s" % conditions)

        # Recuperar as associacoes para o produto
        associations = Association().get_associations_by_product_id(product.pk)

        self.logger.debug("Associations: %s" % associations)

        # Criar o Statement
        catalog_db = TargetObjectsDBHelper(
            table=product.table.tbl_name,
            schema=product.table.tbl_schema,
            database=product.table.tbl_database,
            associations=associations,
            product=product,
            user=user,
        )

        # Executa a query e gera um dataset
        records, count = catalog_db.query(
            filters=conditions,
        )

        df = pd.DataFrame(records)

        # Remove as colunas de rating e reject
        df.drop(['_meta_rating_id', '_meta_rating', '_meta_reject_id', '_meta_reject', ], axis='columns', inplace=True)
        # Colocar todos os headers para minusculo.
        df.columns = map(str.lower, df.columns)

        # Recuperar a propriedade que representa a primary key
        property_id = associations.get("meta.id;meta.main").lower()
        self.logger.info("Property Id: [%s]" % property_id)

        try:
            df[property_id] = df[property_id].astype('int64')
            df = df.set_index(property_id)
        except Exception as e:
            self.logger.error(e)

        self.logger.debug(df.dtypes)

        self.logger.debug(df.head())

        # Recupera o Schema necessário para criação da tabela e registro.
        schema = catalog_db.get_connection_schema()

        self.logger.debug("Schema: %s" % schema)

        # Criar a Tabela
        self.logger.info("Creating the table and importing the data.")
        self.logger.info("Schema: [%s] Tablename: [%s] Rows: [%s]" % (schema, tablename, df.shape[0]))

        # Verificar se o database aceita inserts multiplos
        bulk_insert = 'multi' if catalog_db.database.accept_bulk_insert() else None
        self.logger.info("Bulk Inserts: [%s]" % bulk_insert)

        try:
            df.to_sql(
                # None da tabela
                tablename,
                # engine da conexão com database.
                catalog_db.engine,
                # Schema onde a tabela vai ser criada.
                schema=schema,
                # How to behave if the table already exists.
                if_exists='fail',  # Use 'replace' in development and tests.
                # Cria a coluna de index do dataframe como uma coluna no DB.
                index=True,
                # Nome da coluna que representa o index do DF.
                index_label=property_id,
                # Tamanhos das intruções de insert divididos em pedaços.
                chunksize=1000,
                # Controls the SQL insertion clause used: None for individual insert and 'multi' for multiple values in single insert.
                # 'multi' é a oplão mais rapida.
                method=bulk_insert
            )
        except Exception as e:
            msg = "Failed to create the table and import the data. Error: [%s]" % e
            self.logger.error(msg)
            # Verifica se a tabela foi criada
            if catalog_db.table_exists(tablename, schema):
                # Drop Table
                catalog_db.drop_table(tablename, schema)

                self.logger.info("Droped  Table: [%s] Schema: [%s]" % (tablename, schema))

            raise (Exception(msg))

        # Registar a tabela como produto
        self.register_new_table_as_product(user, product, schema, tablename, name, description)

        new_product = Product.objects.get(
            prd_display_name=name,
            table__tbl_name=tablename,
            table__tbl_schema=schema,
            table__tbl_database=product.table.tbl_database
        )

        self.notify_user_success(user, name, new_product)

    def create_table_as(self, database, table, stm, schema=None):
        self.logger.info("Create new table %s" % table)

        self.logger.debug("Database: %s" % database)
        self.logger.debug("Schema: %s" % schema)
        self.logger.debug("Table: %s" % table)

        self.logger.debug("Query: %s" % str(stm))
        catalog = CatalogDB(db=database)

        # Verifica se a tabela nao existe
        if catalog.table_exists(table, schema):
            raise Exception("Table %s already exists." % table)

        catalog.create_table_as(table=table, stm=stm, schema=schema)

        self.logger.info("Table created successfully.")

    def register_new_table_as_product(self, user, original_product, schema, tablename, name, description=None):

        self.logger.info("Register the new table as a product")

        # Releases
        self.logger.info("Loading Releases")
        releases = list()
        for mRelease in original_product.releases.all():
            releases.append(mRelease.rls_name)

        self.logger.debug(releases)

        # Tags
        self.logger.info("Loading Tags")
        tags = list()
        for mTag in original_product.tags.all():
            tags.append(mTag.tag_name)

        self.logger.debug(tags)

        # Associations
        self.logger.info("Loading Associations")
        associations = Association().get_association_list_by_product_id(original_product.pk)

        self.logger.debug(associations)

        # Dados para o registro
        data = list([{
            "process_id": None,
            "name": tablename,
            "display_name": name,
            "database": original_product.table.tbl_database,
            "schema": schema,
            "table": tablename,
            "filter": original_product.prd_filter,
            "releases": releases,
            "fields": tags,
            "association": associations,
            "type": "catalog",
            "class": original_product.prd_class.pcl_name,
            "description": description
        }])

        self.logger.debug("Register Data")
        self.logger.debug(data)

        # Registar o novo produto
        import_product = Import()

        import_product.user = user
        import_product.owner = user
        import_product.site = None
        import_product.process = None

        import_product.import_products(data)

        self.logger.info("New Product as Registered")

    def notify_user_start(self, user, name):
        """
        Envia um email para o usuario informando que o Save As iniciou.
        """

        if user.email:
            self.logger.info("Sending mail notification.")
            subject = "Save As Started"

            body = render_to_string("saveas_notification_start.html", {
                "username": user.username,
                "target_display_name": name,
            })

            Notify().send_email(subject, body, user.email)

    def notify_user_success(self, user, name, new_product):
        """
        Envia um email para o usuario informando que o Save As terminou.
        neste email tem um link para o target na lista recem criada.
        """
        if user.email:
            self.logger.info("Sending mail notification.")
            host = settings.BASE_HOST
            url = urljoin(host, os.path.join("/target/#cv", str(new_product.pk)))

            subject = "Save As Finish"

            body = render_to_string("saveas_notification_finish.html", {
                "username": user.username,
                "target_display_name": name,
                # "tablename": new_product.table.tbl_name,
                # "rows": new_product.table.catalog.ctl_num_objects,
                "url": url
            })

            Notify().send_email(subject, body, user.email)

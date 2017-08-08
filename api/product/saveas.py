import logging
import os
from smtplib import SMTPException
from urllib.parse import urljoin

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from lib.CatalogDB import CatalogDB
from lib.CatalogDB import TargetObjectsDBHelper
from product_register.ImportProcess import Import

from .association import Association
from .models import FilterCondition
from .models import Product
from .serializers import FConditionSerializer


class SaveAs:
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger()

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

        # Recuperar no Settigs em qual schema do database estao as tabelas de rating e reject
        schema_rating_reject = settings.SCHEMA_RATING_REJECT

        # Recuperar as associacoes para o produto
        associations = Association().get_associations_by_product_id(product.pk)

        # Criar o Statement
        catalog_db = TargetObjectsDBHelper(
            table=product.table.tbl_name,
            schema=product.table.tbl_schema,
            database=product.table.tbl_database,
            associations=associations,
            schema_rating_reject=schema_rating_reject
        )

        columns = catalog_db.column_names

        stm = catalog_db.create_stm(
            filters=conditions,
            columns=columns
        )

        # Criar a Tabela
        self.create_table_as(
            database=product.table.tbl_database,
            schema=product.table.tbl_schema,
            table=tablename,
            stm=stm
        )

        # Registar a tabela como produto
        self.register_new_table_as_product(user, product, tablename, name, description)

        new_product = Product.objects.get(
            prd_display_name=name,
            table__tbl_name=tablename,
            table__tbl_schema=product.table.tbl_schema,
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

        catalog.create_table_as(table=table, schema=schema, stm=stm)

        self.logger.info("Table created successfully.")


    def register_new_table_as_product(self, user, original_product, tablename, name, description=None):

        self.logger.info("Register the new table as a product")

        # Releases
        releases = list()
        for mRelease in original_product.releases.all():
            releases.append(mRelease.rls_name)

        # Tags
        tags = list()
        for mTag in original_product.tags.all():
            tags.append(mTag.rls_name)

        associations = Association().get_association_list_by_product_id(original_product.pk)

        # Dados para o registro
        data = list([{
            "process_id": None,
            "name": tablename,
            "display_name": name,
            "database": original_product.table.tbl_database,
            "schema": original_product.table.tbl_schema,
            "table": tablename,
            "filter": original_product.prd_filter,
            "releases": releases,
            "fields": tags,
            "association": associations,
            "type": "catalog",
            "class": original_product.prd_class.pcl_name,
            "description": description
        }])

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
        try:
            if user.email:
                try:
                    from_email = settings.EMAIL_NOTIFICATION
                except:
                    raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

                subject = "LIneA Science Server - Save As Started"

                body = render_to_string("saveas_notification_start.html", {
                    "username": user.username,
                    "target_display_name": name,
                })

                msg = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=from_email,
                    to=[user.email],
                )
                msg.content_subtype = "html"
                msg.send(fail_silently=False)


        except SMTPException as e:
            pass

    def notify_user_success(self, user, name, new_product):
        """
        Envia um email para o usuario informando que o Save As terminou.
        neste email tem um link para o target na lista recem criada.
        """
        try:
            if user.email:
                try:
                    from_email = settings.EMAIL_NOTIFICATION
                except:
                    raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

                host = settings.BASE_HOST
                url = urljoin(host, os.path.join("dri/apps/target/#cv", str(new_product.pk)))

                subject = "LIneA Science Server - Save As Finish"

                body = render_to_string("saveas_notification_finish.html", {
                    "username": user.username,
                    "target_display_name": name,
                    # "tablename": new_product.table.tbl_name,
                    # "rows": new_product.table.catalog.ctl_num_objects,
                    "url": url
                })

                msg = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=from_email,
                    to=[user.email],
                )
                msg.content_subtype = "html"
                msg.send(fail_silently=False)


        except SMTPException as e:
            pass

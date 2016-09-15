from lib.CatalogDB import CatalogDB
from product.serializers import CatalogSerializer, ProductContentSerializer
from product_classifier.models import ProductClass
from rest_framework import status
from rest_framework.response import Response

from .models import Site, Authorization
from .serializers import ExternalProcessSerializer


class Import():
    db = None

    def start_import(self, request):

        self.user = request.user
        self.data = request.data
        self.site = self.get_site(self.user)
        self.context = {
            'request': request
        }

        if 'ticket' in self.data:
            self.owner = self.get_owner(self.data.get('ticket'))

        else:
            raise Exception('the ticket parameter is required.')

        if 'process' in self.data:
            return self.import_process(self.data.get('process'))

        else:
            return Response(
                data={"It is still not possible to import a product without being associated with a process."},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

    def get_owner(self, ticket):

        try:
            record = Authorization.objects.get(ath_ticket=ticket)
            return record.ath_owner

        except Authorization.DoesNotExist:
            raise Exception('This ticket %s is not valid.' % ticket)


    def get_site(self, user):

        if not user:
            raise Exception('%s is not a valid user instance.' % user)

        site = Site.objects.get(sti_user=user.pk)

        if not site:
            raise Exception('There is no site associated with this user.')

        return site

    def import_process(self, data):

        # Parse Json to model properties
        process_data = {
            "epr_owner": self.owner.pk,
            "epr_site": self.site.pk,
            "epr_username": data.get('owner_username'),
            "epr_name": data.get('process_name', ''),
            "epr_original_id": data.get('process_id', None),
            "epr_start_date": data.get('process_start_date', ''),
            "epr_end_date": data.get('process_end_date', ''),
            "epr_readme": data.get('process_description', ''),
            "epr_comment": data.get('process_comment', ''),
        }

        process_serializer = ExternalProcessSerializer(
            data=process_data, context=self.context)

        if process_serializer.is_valid(raise_exception=True):
            self.process = process_serializer.save()

        # Registrar os produtos
        if 'products' in data and len(data.get('products')) > 0:
            self.import_products(data.get('products'))

        else:
            raise Exception('Any product to be imported.')

        return Response(
            data=process_serializer.data,
            status=status.HTTP_201_CREATED
        )

    def import_products(self, data):
        """
        Registrar os produtos de acordo com o type
        """
        for product in data:
            if product.get('type') == 'catalog':
                self.register_catalog(product)
            else:
                raise Exception('Product Type not implemented yet.')

    def register_catalog(self, data):

        # Instancia do banco de catalogo
        if not self.db:
            con = CatalogDB()
            self.db = con.wrapper

        tablename = self.db.get_tablename(data.get('schema', None), data.get('table'))

        # Recuperar a quantidade de linhas da tabela
        count = self.db.get_count(tablename)

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        catalog_data = {
            "prd_process_id": self.process.pk,
            "prd_class": cls.pk,
            "prd_name": data.get('name'),
            "prd_display_name": data.get('display_name'),
            "ctl_num_objects": count,
            "tbl_schema": data.get('scheme', None),
            "tbl_name": data.get('table'),
            "prd_flag_removed": False
        }

        catalog_serializer = CatalogSerializer(
            data=catalog_data, context=self.context)

        if catalog_serializer.is_valid(raise_exception=True):
            catalog = catalog_serializer.save()

            self.register_catalog_content(catalog)

    def get_product_class(self, name):

        try:
            cls = ProductClass.objects.get(pcl_name=name)
            return cls

        except Exception as error:
            acls = list()
            for cls in ProductClass.objects.all():
                acls.append(cls.pcl_name)
            raise Exception('It is class is not available. these are available: %s' % (', '.join(acls)))

    def register_catalog_content(self, catalog):
        # Recuperar as colunas do catalogo.
        tablename = self.db.get_tablename(catalog.tbl_schema, catalog.tbl_name)

        columns = self.db.get_table_columns(tablename)

        if columns and len(columns) > 0:
            for column in columns:
                column_serializer = ProductContentSerializer(
                    data={
                        'pcn_product_id': catalog.pk,
                        'pcn_column_name': column
                    },
                    context=self.context)

                if column_serializer.is_valid():
                    column_serializer.save()

from common.models import Filter
from coadd.models import Release, Tag
from lib.CatalogDB import CatalogDB
from product_classifier.models import ProductClass
from product_register.models import ProcessRelease
from product.models import Catalog, Map, ProductContent, ProductRelease, ProductTag
from rest_framework import status
from rest_framework.response import Response

from .models import Site, Authorization, ExternalProcess


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

    # =============================< PROCESS >=============================
    def import_process(self, data):

        process, created = ExternalProcess.objects.update_or_create(
            epr_site=self.site,
            epr_owner=self.owner,
            epr_name=data.get('process_name', ''),
            epr_original_id=data.get('process_id', None),
            defaults={
                "epr_username": data.get('owner_username'),
                "epr_start_date": data.get('process_start_date', ''),
                "epr_end_date": data.get('process_end_date', ''),
                "epr_readme": data.get('process_description', ''),
                "epr_comment": data.get('process_comment', ''),
            }
        )

        if process:
            self.process = process

            # Associar um Release ao Processo
            if 'releases' in data:
                self.process_release(self.process, data.get('releases'))

            # Registrar os produtos
            if 'products' in data and len(data.get('products')) > 0:
                self.import_products(data.get('products'))

            else:
                raise Exception('Any product to be imported.')

            return Response(
                status=status.HTTP_201_CREATED
            )

        else:
            raise Exception(
                "A failure has occurred and it was not possible to register the process '%s'." % (
                    data.get('process_name')))

    def process_release(self, process, releases):
        for r in releases:
            rls_name = r.lower()
            try:
                release = Release.objects.get(rls_name=rls_name)

                # Associar Process a Release
                pr = ProcessRelease.objects.create(
                    process=process,
                    release=release
                )

                pr.save()

            except Release.DoesNotExist:
                raise Exception("this Release '%s' is not valid." % rls_name)

    def import_products(self, data):
        """
        Registrar os produtos de acordo com o type
        """
        for product in data:
            if product.get('type') == 'catalog':
                self.register_catalog(product)

            elif product.get('type') == 'map':
                self.register_map(product)

            else:
                raise Exception('Product Type not implemented yet.')

    # =============================< CATALOG >=============================
    def register_catalog(self, data):
        """
        Registra produtos do tipo Catalog, apos a criacao do model catalog,
        e executado o registro das colunas do catalogo.
        Args:
            data:

        Returns:

        """
        # Instancia do banco de catalogo
        if not self.db:
            con = CatalogDB()
            self.db = con.wrapper

        # Verifica se a tabela existe
        self.db.table_exists(data.get('schema', None), data.get('table'))

        # Recupera o nome da tabela
        tablename = self.db.get_tablename(data.get('schema', None), data.get('table'))

        # Recuperar a quantidade de linhas da tabela
        count = self.db.get_count(tablename)

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        product, created = Catalog.objects.update_or_create(
            prd_name=data.get('name'),
            tbl_schema=data.get('scheme', None),
            tbl_name=data.get('table'),
            defaults={
                "prd_process_id": self.process,
                "prd_class": cls,
                "prd_display_name": data.get('display_name'),
                "prd_product_id": data.get('product_id', None),
                "prd_version": data.get('version', None),
                "prd_flag_removed": False,
                "prd_description": data.get('description', None),
                "ctl_num_objects": count,
            }
        )

        if product:
            if 'releases' in data:
                self.product_release(product, data.get('releases'))

            # Registrar O produto a seus respectivos Tags
            if 'fields' in data:
                add_release = True
                if 'releases' in data:
                    add_release = False

                self.product_tag(product, data.get('fields'), add_release)

            # Registar as colunas do catalogo
            self.register_catalog_content(product, created)

            return True
        else:
            raise Exception(
                "A failure has occurred and it was not possible to register the product '%s'." % (data.get('name')))

    def get_product_class(self, name):
        try:
            cls = ProductClass.objects.get(pcl_name=name)
            return cls

        except Exception as error:
            acls = list()
            for cls in ProductClass.objects.all():
                acls.append(cls.pcl_name)
            raise Exception('It is class is not available. these are available: %s' % (', '.join(acls)))

    def register_catalog_content(self, catalog, created):
        """
        Registra todas as colunas de um catalogo,
        em caso de update remove todas as colunas do catalogo e adiciona novamente.
        Args:
            catalog:

        Returns:

        """
        if not created:
            # Apaga todas as colunas do catalogo para inserir novamente.
            ProductContent.objects.filter(pcn_product_id=catalog).delete()

        # Recuperar as colunas do catalogo.
        tablename = self.db.get_tablename(catalog.tbl_schema, catalog.tbl_name)

        columns = self.db.get_table_columns(tablename)

        if columns and len(columns) > 0:
            for column in columns:
                content = ProductContent.objects.create(
                    pcn_product_id=catalog,
                    pcn_column_name=column
                )

    def product_release(self, product, releases):
        for r in releases:
            rls_name = r.lower()
            try:
                release = Release.objects.get(rls_name=rls_name)

                # Associar Product a Release
                pr = ProductRelease.objects.create(
                    product=product.product_ptr,
                    release=release
                )

                pr.save()

            except Release.DoesNotExist:
                raise Exception("this Release '%s' is not valid." % rls_name)

    def product_tag(self, product, tags, add_release):

        for t in tags:
            tag_name = t.lower()

            try:
                tag = Tag.objects.get(tag_name=tag_name)

                # Associar Product a Tag
                pt = ProductTag.objects.create(
                    product=product.product_ptr,
                    tag=tag
                )

                pt.save()

                if add_release:
                    rls_name = tag.tag_release.rls_name
                    self.product_release(product, [rls_name])

            except Tag.DoesNotExist:
                raise Exception("this Tag '%s' is not valid." % tag_name)

    # =============================< MAP >=============================
    def register_map(self, data):
        # Instancia do banco de catalogo
        if not self.db:
            con = CatalogDB()
            self.db = con.wrapper

        # Checar se a tabela existe
        self.db.table_exists(data.get('schema', None), data.get('table'))

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        # Recuperar o filtro
        filter = self.get_filter(data.get('filter'))

        product, created = Map.objects.update_or_create(
            prd_name=data.get('name'),
            tbl_schema=data.get('scheme', None),
            tbl_name=data.get('table'),
            defaults={
                "prd_process_id": self.process,
                "prd_class": cls,
                "prd_display_name": data.get('display_name'),
                "prd_product_id": data.get('product_id', None),
                "prd_version": data.get('version', None),
                "prd_flag_removed": False,
                "prd_description": data.get('description', None),
                "mpa_nside": self.check_nside(data.get('nside')),
                "mpa_ordering": self.check_ordering(data.get('ordering')),
                "mpa_filter": filter,
            }
        )

    def check_ordering(self, ordering):

        available = ['ring', 'nest']
        if ordering not in available:
            raise Exception(
                "This ordering '%s' is not valid. Available ordering is [ %s ]" % (ordering, ', '.join(available)))

        return ordering

    def check_nside(self, nside):

        available = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
        if int(nside) not in available:
            raise Exception("This nside '%s' is not valid. Available nside is [ %s ]" % (nside, ', '.join(available)))

        return nside

    def get_filter(self, filter_name):
        try:
            f = Filter.objects.get(filter=filter_name)
            return f

        except Filter.DoesNotExist:
            fs = Filter.objects.all()
            a = list()
            for f in fs:
                a.append(f.filter)
            a = ', '.join(a)
            raise Exception("This filter '%s' is not valid. Available filters is [ %s ]" % (filter_name, a))

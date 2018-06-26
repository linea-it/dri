from datetime import datetime

from coadd.models import Release, Tag
from common.models import Filter
from django.db.models import Q
from lib.CatalogDB import CatalogDB
from product.models import Catalog, Map, Mask, ProductContent, ProductRelease, ProductTag, ProductContentAssociation, \
    ProductRelated
from product_classifier.models import ProductClass, ProductClassContent
from product_register.models import ProcessRelease
from rest_framework import status
from rest_framework.response import Response

from .models import Site, Authorization, ExternalProcess, Export


class Import():
    db = None

    def __init__(self):
        # Guarda um dict com a classe de cada produto e a intancia do ProductModel
        # ex:
        # dict({
        # 'galaxy_clusters': ProductModel
        # 'cluster_memebers': ProductModel
        # 'vac': ProductModel
        # })

        self._products_classes = dict({})        

    def start_import(self, request):

        self.user = request.user
        self.data = request.data
        self.site = self.get_site(self.user)
        self.context = {
            'request': request
        }

        # Ticket server para identificar o owner do processo quando
        # o processo esta sendo importado por outro sistema, nesse caso o user logado
        # sera o sistema externo autenticado pelo token, e o owner sera recuperado pelo ticket.
        if 'ticket' in self.data:
            self.owner = self.get_owner(self.data.get('ticket'))
        else:
            # Caso a requisicao seja feita pelo proprio portal
            # havera um usuario logado mas nao havera um site
            # o owner do processo sera o usuario logado
            if self.user and (self.site is None):
                self.owner = self.user
            else:
                raise Exception('the ticket parameter is required.')

        if 'process' in self.data:
            return self.import_process(self.data.get('process'))

        else:
            if 'products' in self.data and len(self.data.get('products')) > 0:
                self.process = None

                self.import_products(self.data.get('products'))

                return Response(
                    status=status.HTTP_201_CREATED
                )

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

        try:
            return Site.objects.get(sti_user=user.pk)
        except Site.DoesNotExist:
            return None

    # =============================< PROCESS >=============================
    def import_process(self, data):

        process, created = ExternalProcess.objects.update_or_create(
            epr_site=self.site,
            epr_owner=self.owner,
            epr_name=data.get('process_name', None),
            epr_original_id=data.get('process_id', None),
            defaults={
                "epr_username": data.get('owner_username'),
                "epr_start_date": data.get('process_start_date', None),
                "epr_end_date": data.get('process_end_date', None),
                "epr_readme": data.get('process_description', None),
                "epr_comment": data.get('process_comment', None),
            }
        )

        if process:
            self.process = process

            add_release = True
            # Associar um Release ao Processo
            if 'releases' in data and len(data.get('releases')) > 0:
                self.process_release(self.process, data.get('releases'))
                add_release = False

            if 'fields' in data and len(data.get('fields')) > 0:
                self.process_tags(self.process, data.get('fields'), add_release)

            # Registrar dados do export
            if 'register_username' in self.data:
                self.process_export(self.process, self.data)

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

    def process_tags(self, process, tags, add_release=True):
        for t in tags:
            tag_name = t.lower()

            try:
                tag = Tag.objects.get(tag_name=tag_name)

                if add_release:
                    rls_name = tag.tag_release.rls_name
                    self.process_release(process, [rls_name])

            except Tag.DoesNotExist:
                raise Exception("this Tag '%s' is not valid." % tag_name)


    def process_export(self, process, data):

        # Associar Process a Export
        export = Export.objects.create(
            process=process,
            exp_username=data.get('register_username')
        )

        export.save()

    def import_products(self, data):
        """
        Registrar os produtos de acordo com o type
        """
        for product in data:
            if product.get('type') == 'catalog':
                self.register_catalog(product)

            elif product.get('type') == 'map':
                self.register_map(product)

            elif product.get('type') == 'mask':
                self.register_mask(product)

            else:
                raise Exception("Product Type '%s' not implemented yet." % product.get('type'))

        

        # Verificar a classe dos produtos se for galaxy cluster ou cluster members deve ser feita a ligacao entre as 2
        if ('galaxy_clusters' in self._products_classes) and ('cluster_members' in self._products_classes):
            self.link_galaxy_cluster_with_cluster_members()

        # Verificar a classe dos produtos se for galaxy cluster e vac da classe vac_cluster
        if ('galaxy_clusters' in self._products_classes) and ('vac_cluster' in self._products_classes):
            self.link_galaxy_cluster_with_vac_cluster()

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
        # Recupera a instancia de banco de dados enviada pela requisicao ou utiliza o catalog como default
        database = data.get('database', 'catalog')

        if not self.db:
            self.db = CatalogDB(db=database)

        if not self.db.table_exists(data.get('table'), schema=data.get('schema', None)):
            raise Exception("Table or view  %s.%s does not exist" %
                            (data.get('schema', None), data.get('table')))

        # Recuperar a quantidade de linhas da tabela
        count = 0
        if data.get('class') is not 'coadd_objects':
            count = self.db.get_count(data.get('table'), schema=data.get('schema', None))

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        tbl_info = data.get('ora_table_info', None)
        tbl_rows = None
        tbl_num_columns = None
        tbl_size = None
        if tbl_info:
            tbl_rows = tbl_info.get('n_imported_rows', None)
            tbl_num_columns = tbl_info.get('n_imported_columns', None)
            tbl_size = tbl_info.get('table_size_in_bytes', None)

        # Data do produto caso o produto tenha processo a data do produto = data de start do processo
        date = None
        if self.process is not None:
            date = self.process.epr_start_date
        else:
            date = datetime.now()


        # Verificar se o process id do produto e igual ao proccess id do external_proccess
        # TODO esta etapa deve ser substituida com a implementacao de import inputs ou provenance
        if self.process is not None and self.process.epr_original_id != str(data.get("process_id")):
            # Se for diferente cria um novo external proccess para ser associado ao producto.
            product_process, created = ExternalProcess.objects.update_or_create(
                epr_site=self.site,
                epr_owner=self.owner,
                epr_name=data.get('pipeline', None),
                epr_original_id=data.get('process_id', None),
                defaults={
                    "epr_username": self.owner.username,
                }
            )

            if product_process:

                add_release = True
                # Associar um Release ao Processo
                if 'releases' in data and len(data.get('releases')) > 0:
                    self.process_release(product_process, data.get('releases'))
                    add_release = False

                if 'fields' in data and len(data.get('fields')) > 0:
                    self.process_tags(product_process, data.get('fields'), add_release)

        else:
            product_process = self.process

        product, created = Catalog.objects.update_or_create(
            prd_owner=self.owner,
            prd_name=data.get('name').replace(' ', '_').lower(),
            tbl_database=data.get('database', None),
            tbl_schema=data.get('schema', None),
            tbl_name=data.get('table'),
            defaults={
                "prd_process_id": product_process,
                "prd_class": cls,
                "prd_display_name": data.get('display_name'),
                "prd_product_id": data.get('product_id', None),
                "prd_version": data.get('version', None),
                "prd_description": data.get('description', None),
                "prd_date": date,
                "prd_is_public": data.get('is_public', False),
                "tbl_rows": tbl_rows,
                "tbl_num_columns": tbl_num_columns,
                "tbl_size": tbl_size,
                "ctl_num_objects": count,
            }
        )

        if product:
            add_release = True

            if 'releases' in data and len(data.get('releases')) > 0:
                self.product_release(product, data.get('releases'))
                add_release = False

            # Registrar O produto a seus respectivos Tags
            if 'fields' in data:
                self.product_tag(product, data.get('fields'), add_release)

            # Registar as colunas do catalogo
            self.register_catalog_content(product, data, created)

            # guarda a classe do produto e a instancia de ProductModel
            self._products_classes[product.prd_class.pcl_name] = product


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

    def register_catalog_content(self, catalog, data, created):
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
        columns = self.db.get_table_columns(catalog.tbl_name, catalog.tbl_schema)

        if columns and len(columns) > 0:
            for column in columns:
                content = ProductContent.objects.create(
                    pcn_product_id=catalog,
                    pcn_column_name=column.strip()
                )

        self.product_content_association(catalog, data, created)

    def product_content_association(self, product, data, created):

        meta = list()

        if 'association' in data:
            for p in data.get("association"):
                if ('property' in p and p.get('property') is not None) and ('ucd' in p and p.get('ucd') is not None):
                    meta.append(p)

        else:
            # Se o produto for da classe coadd_objects fazer a associacao de colunas
            #  Tem um diferenca que o Y1A1 a coluna coadd_object tem outro nome
            if product.prd_class.pcl_name == 'coadd_objects':
                # propriedades a serem associadas
                meta = list([
                    dict({'property': 'coadd_object_id', 'ucd': 'meta.id;meta.main'}),
                    dict({'property': 'ra', 'ucd': 'pos.eq.ra;meta.main'}),
                    dict({'property': 'dec', 'ucd': 'pos.eq.dec;meta.main'}),
                    dict({'property': 'a_image', 'ucd': 'phys.size.smajAxis;instr.det;meta.main'}),
                    dict({'property': 'b_image', 'ucd': 'phys.size.sminAxis;instr.det;meta.main'}),
                    dict({'property': 'theta_j2000', 'ucd': 'pos.posAng;instr.det;meta.main'}),
                    dict({'property': 'mag_auto_g', 'ucd': 'phot.mag;meta.main;em.opt.g'}),
                    dict({'property': 'mag_auto_r', 'ucd': 'phot.mag;meta.main;em.opt.r'}),
                    dict({'property': 'mag_auto_i', 'ucd': 'phot.mag;meta.main;em.opt.i'}),
                    dict({'property': 'mag_auto_z', 'ucd': 'phot.mag;meta.main;em.opt.z'}),
                    dict({'property': 'mag_auto_y', 'ucd': 'phot.mag;meta.main;em.opt.Y'})
                ])

        # Se for um update do produto
        if not created:
            # Apaga todas as associacoes para inserir novamente.
            ProductContentAssociation.objects.filter(pca_product=product).delete()

        for p in meta:
            # para cada propriedade a ser associada
            property = p.get('property')

            try:
                # recuperar content do produto
                pc = ProductContent.objects.get(pcn_product_id=product, pcn_column_name__iexact=property)

                try:
                    # recuperar class content
                    # Todas as propriedades que comuns a todas as classes + as propriedades expecificas da classe.
                    cc = ProductClassContent.objects.filter(
                        Q(pcc_ucd__iexact=p.get('ucd')),
                        Q(pcc_class=product.prd_class) | Q(pcc_class__isnull=True)).get()

                    association = ProductContentAssociation.objects.create(
                        pca_product=product,
                        pca_class_content=cc,
                        pca_product_content=pc
                    )

                except ProductClassContent.DoesNotExist:
                    # se nao tiver o ucd na classe nao faz nada
                    pass

                # Guardar o UCD que foi enviado mesmo que ele nao pertenca a uma classe
                if p.get('ucd') is not '':
                    pc.pcn_ucd = p.get('ucd')
                    pc.save()

            except:
                raise Exception("it was not possible to create association for this column: %s" % property)

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

    def link_galaxy_cluster_with_cluster_members(self):
        """
            Este metodo so e executado caso um processo possua 2 produtos
            1 da classe galaxy_clusters e outro da classe cluster_members
            esses produtos devem ser linkados atraves do model ProductRelated
            e necessario que o produto de members tenha uma propriedade com ucd meta.id.cross.
        :return:
        """
        gc = self._products_classes.get('galaxy_clusters')
        cm = self._products_classes.get('cluster_members')

        # descobrir a propriedade que tem a associacao de cross_identification no produto de cluster members
        try:
            cross_identification = ProductContent.objects.get(pcn_product_id=cm.pk, pcn_ucd='meta.id.cross')

            prd_related = ProductRelated.objects.update_or_create(
                prl_product=gc,
                prl_related=cm,
                defaults={
                    "prl_relation_type": "join",
                    "prl_cross_identification": cross_identification
                }
            )

        except ProductContent.DoesNotExist:
            raise Exception(
                "this cluster members product %s does not have a property with ucd meta.id.cross to be associated with "
                "the galaxy cluster product." % cm.prd_display_name)


    def link_galaxy_cluster_with_vac_cluster(self):
        """
            Este metodo e especifico para o processo de WAZP.
            caso o processo tenha galaxy_cluster, cluster_members e vac_cluster
            o vac na verdade e um imput mais ate este momento nao foi definido um metodo para registrar inputs de processos.
            quando houver uma forma de importar os imputs este metodo devera ser removido.
        :return:
        """

        gc = self._products_classes.get('galaxy_clusters')
        vc = self._products_classes.get('vac_cluster')

        # Criar uma relacao entre o produto de galaxy cluster e o vac que foi usado como input
        prd_related = ProductRelated.objects.update_or_create(
            prl_product=gc,
            prl_related=vc,
            defaults={
                "prl_relation_type": "input",
                "prl_cross_identification": None
            }
        )


    # =============================< MAP >=============================
    def register_map(self, data):
        if not self.db:
            self.db = CatalogDB()

        if not self.db.table_exists(data.get('table'), schema=data.get('schema', None)):
            raise Exception("Table or view  %s.%s does not exist" %
                            (data.get('schema', None), data.get('table')))

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        # Recuperar o filtro
        filter = self.get_filter(data.get('filter'))

        tbl_info = data.get('ora_table_info', None)
        tbl_rows = None
        tbl_num_columns = None
        tbl_size = None
        if tbl_info:
            tbl_rows = tbl_info.get('n_imported_rows', None)
            tbl_num_columns = tbl_info.get('n_imported_columns', None)
            tbl_size = tbl_info.get('table_size_in_bytes', None)

        # Data do produto caso o produto tenha processo a data do produto = data de start do processo
        date = None
        if self.process is not None:
            date = self.process.epr_start_date

        product, created = Map.objects.update_or_create(
            prd_owner=self.owner,
            prd_name=data.get('name').replace(' ', '_').lower(),
            tbl_schema=data.get('schema', None),
            tbl_name=data.get('table'),
            defaults={
                "prd_process_id": self.process,
                "prd_class": cls,
                "prd_display_name": data.get('display_name'),
                "prd_user_display_name": data.get('user_display_name'),
                "prd_product_id": data.get('product_id', None),
                "prd_version": data.get('version', None),
                "prd_description": data.get('description', None),
                "prd_filter": filter,
                "prd_date": date,
                "prd_is_public": data.get('is_public', True),
                "mpa_nside": self.check_nside(data.get('nside')),
                "mpa_ordering": self.check_ordering(data.get('ordering')),
                "tbl_rows": tbl_rows,
                "tbl_num_columns": tbl_num_columns,
                "tbl_size": tbl_size,
            }
        )

        if product:
            add_release = True

            if 'releases' in data and len(data.get('releases')) > 0:
                self.product_release(product, data.get('releases'))
                add_release = False

            # Registrar O produto a seus respectivos Tags
            if 'fields' in data:
                self.product_tag(product, data.get('fields'), add_release)
        else:
            raise Exception(
                "A failure has occurred and it was not possible to register the product '%s'." % (data.get('name')))

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

        if filter_name is None:
            return None

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

    # =============================< MASK >=============================
    def register_mask(self, data):
        if not self.db:
            self.db = CatalogDB()

        if not self.db.table_exists(data.get('table'), schema=data.get('schema', None)):
            raise Exception("Table or view  %s.%s does not exist" %
                            (data.get('schema', None), data.get('table')))

        # Recuperar a classe do produto
        cls = self.get_product_class(data.get('class'))

        # Recuperar o filtro
        filter = self.get_filter(data.get('filter'))

        tbl_info = data.get('ora_table_info', None)
        tbl_rows = None
        tbl_num_columns = None
        tbl_size = None
        if tbl_info:
            tbl_rows = tbl_info.get('n_imported_rows', None)
            tbl_num_columns = tbl_info.get('n_imported_columns', None)
            tbl_size = tbl_info.get('table_size_in_bytes', None)

        # Data do produto caso o produto tenha processo a data do produto = data de start do processo
        date = None
        if self.process is not None:
            date = self.process.epr_start_date

        product, created = Mask.objects.update_or_create(
            prd_owner=self.owner,
            prd_name=data.get('name').replace(' ', '_').lower(),
            tbl_schema=data.get('schema', None),
            tbl_name=data.get('table'),
            defaults={
                "prd_process_id": self.process,
                "prd_class": cls,
                "prd_display_name": data.get('display_name'),
                "prd_product_id": data.get('product_id', None),
                "prd_version": data.get('version', None),
                "prd_description": data.get('description', None),
                "prd_date": date,
                "prd_is_public": data.get('is_public', True),
                "msk_filter": filter,
                "tbl_rows": tbl_rows,
                "tbl_num_columns": tbl_num_columns,
                "tbl_size": tbl_size,
            }
        )

        if product:
            add_release = True

            if 'releases' in data and len(data.get('releases')) > 0:
                self.product_release(product, data.get('releases'))
                add_release = False

            # Registrar O produto a seus respectivos Tags
            if 'fields' in data:
                self.product_tag(product, data.get('fields'), add_release)
        else:
            raise Exception(
                "A failure has occurred and it was not possible to register the product '%s'." % (data.get('name')))

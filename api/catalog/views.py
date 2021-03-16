import math

from django.conf import settings
from django.db.models import Max
from lib.CatalogDB import CatalogObjectsDBHelper, TargetObjectsDBHelper, CatalogDB
from product.association import Association
from product.models import Catalog
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import Comments, Rating, Reject
from .serializers import CommentsSerializer, RatingSerializer, RejectSerializer


class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Rating to be viewed or edited
    """
    queryset = Rating.objects.all()

    serializer_class = RatingSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'rating')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.pk)


class RejectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Reject to be viewed or edited
    """
    queryset = Reject.objects.all()

    serializer_class = RejectSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'reject')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user.pk)


class CommentsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Comments to be viewed or edited
    """
    queryset = Comments.objects.all()

    serializer_class = CommentsSerializer

    filter_fields = ('id', 'catalog_id', 'owner', 'object_id', 'comments')

    ordering_fields = ('id', 'date')

    def perform_create(self, serializer):
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')

        # TODO: Rever essa solução tentar deixar igual ao comportamento do rating e reject.
        #     Workaround para corrigir bug reportado na issue https://github.com/linea-it/dri/issues/1282
        # Por Algum motivo que eu não consegui descobrir, ocorre um erro
        # ao tenta inserir um registro na tabela comments usando Oracle.
        # o Oracle reclama que ID não pode ser Null, mas a coluna id é autoincrement,
        # nas tabelas Rating e Reject é a mesma situação e nelas o erro não acontece.
        # A solução:
        #     Verificar se o banco utilizado é o Oracle.
        #     se for faz uma query para na tabela e depois recupera o ultimo Id
        #     acrescenta +1 e faz o insert usando este ID.

        # Problemas:
        #     - Faz uma query all antes do insert, pode causar um problema de performance se a tabela commens ficar muito grande.
        #     - Pode ocorrer falhar se 2 usuarios fizerem um comment ao mesmo tempo.

        # Verificar se a tabela comments está no Oracle
        catalog_db = CatalogDB(db='catalog')
        if catalog_db.get_engine() == "oracle":
            # Proximo ID
            comments = Comments.objects.all()
            next_id = comments.aggregate(Max('id'))['id__max'] + 1 if comments else 1

            # Faz o Insert
            serializer.save(
                owner=self.request.user.pk,
                pk=next_id
            )
        else:
            # Se não for oracle deixa o Django fazer o processo normal de insert.
            serializer.save(
                owner=self.request.user.pk,
            )


class TargetViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of targets in catalog.
        """

        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        # colunas associadas ao produto
        associations = Association().get_associations_by_product_id(catalog.pk)

        catalog_db = TargetObjectsDBHelper(
            table=catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database,
            associations=associations,
            product=catalog,
            user=request.user
        )

        rows, count = catalog_db.query(
            ordering=request.query_params.get('ordering', None),
            limit=request.query_params.get('limit', None),
            start=request.query_params.get('offset', None),
            url_filters=request.query_params
        )

        for row in rows:
            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
            })

            essential_props = dict({
                # Id
                'meta.id;meta.main': '_meta_id',
                # Coordinates
                'pos.eq.ra;meta.main': '_meta_ra',
                'pos.eq.dec;meta.main': '_meta_dec',
                # Elipse
                'phys.size.smajAxis;instr.det;meta.main': '_meta_a_image',
                'phys.size.sminAxis;instr.det;meta.main': '_meta_b_image',
                'pos.posAng;instr.det;meta.main': '_meta_theta_image',
                # Magnitudes
                'phot.mag;meta.main;em.opt.g': '_meta_mag_auto_g',
                'phot.mag;meta.main;em.opt.r': '_meta_mag_auto_r',
                'phot.mag;meta.main;em.opt.i': '_meta_mag_auto_i',
                'phot.mag;meta.main;em.opt.z': '_meta_mag_auto_z',
                'phot.mag;meta.main;em.opt.Y': '_meta_mag_auto_y',
                # Photo Z
                'src.redshift.phot': '_meta_photo_z',

            })

            for ucd in associations:
                try:
                    meta_prop = essential_props.get(ucd)
                    if meta_prop:
                        value = row.get(associations.get(ucd))

                        row.update({
                            meta_prop: value
                        })

                except:
                    pass

            row.update({
                "_meta_property_id": associations.get("meta.id;meta.main"),
                "_meta_property_ra": associations.get("pos.eq.ra;meta.main"),
                "_meta_property_dec": associations.get("pos.eq.dec;meta.main")
            })

            try:
                # Raio so e obrigatorio para catalogo do tipo sistema
                row.update({
                    "_meta_radius": float(row.get(associations.get("phys.angSize;src"))),
                    "_meta_property_radius": associations.get("phys.angSize;src")
                })
            except:
                pass

            try:
                comments = Comments.objects.filter(
                    catalog_id=catalog.pk, object_id=row.get("_meta_id"))

                row.update({
                    "_meta_comments": comments.count()
                })

            except:
                row.update({
                    "_meta_comments": None
                })

            # FIXED Issue: https://github.com/linea-it/dri/issues/1153
            # Ticket: http://ticket.linea.gov.br/ticket/11761
            for prop in row:
                if isinstance(row.get(prop, None), float):
                    # Check if is infity
                    if math.isinf(row.get(prop)):
                        if row.get(prop) > 0:
                            row.update({prop: "+Infinity"})
                        elif row.get(prop) < 0:
                            row.update({prop: "-Infinity"})

        return Response(dict({
            'count': count,
            'results': rows
        }))


class CatalogObjectsViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of objects in catalog.
        """
        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        # colunas associadas ao produto
        associations = Association().get_associations_by_product_id(product_id)

        # Criar uma lista de colunas baseda nas associacoes isso para limitar a query de nao usar *
        columns = Association().get_properties_associated(product_id)

        catalog_db = CatalogObjectsDBHelper(
            table=catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database,
            associations=associations
        )

        rows, count = catalog_db.query(
            columns=columns,
            ordering=request.query_params.get('ordering', None),
            limit=request.query_params.get('limit', None),
            start=request.query_params.get('offset', None),
            url_filters=request.query_params
        )

        essential_props = dict({
            # Id
            'meta.id;meta.main': '_meta_id',
            # Coordinates
            'pos.eq.ra;meta.main': '_meta_ra',
            'pos.eq.dec;meta.main': '_meta_dec',
            # Elipse
            'phys.size.smajAxis;instr.det;meta.main': '_meta_a_image',
            'phys.size.sminAxis;instr.det;meta.main': '_meta_b_image',
            'pos.posAng;instr.det;meta.main': '_meta_theta_image',
            # Magnitudes
            'phot.mag;meta.main;em.opt.g': '_meta_mag_auto_g',
            'phot.mag;meta.main;em.opt.r': '_meta_mag_auto_r',
            'phot.mag;meta.main;em.opt.i': '_meta_mag_auto_i',
            'phot.mag;meta.main;em.opt.z': '_meta_mag_auto_z',
            'phot.mag;meta.main;em.opt.Y': '_meta_mag_auto_y',
            # Photo Z
            'src.redshift.phot': '_meta_photo_z',
        })

        for row in rows:
            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_catalog_name": catalog.prd_name,
                "_meta_catalog_class": catalog.prd_class.pcl_name,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0
            })

            row.update({
                "_meta_property_id": associations.get("meta.id;meta.main"),
                "_meta_property_ra": associations.get("pos.eq.ra;meta.main"),
                "_meta_property_dec": associations.get("pos.eq.dec;meta.main")
            })

            try:
                # Raio so e obrigatorio para catalogo do tipo sistema
                row.update({
                    "_meta_radius": float(row.get(associations.get("phys.angSize;src"))),
                    "_meta_property_radius": associations.get("phys.angSize;src")
                })
            except:
                pass

            for ucd in associations:
                try:
                    meta_prop = essential_props.get(ucd)
                    if meta_prop:
                        # print(row.get(associations.get(ucd)))
                        value = row.get(associations.get(ucd))

                        # TODO: Esse Bloco precisa de um refactoring
                        """
                            Glauber: 16/08/2017
                         Essa solucao foi adotada por que cada release esta com um valor diferente para 
                         o atributo theta_image e nao ficou muito claro uma forma de tratar esses valores 
                         no banco. solucao rapida por causa de ser vespera de uma reuniao 1/09/2017
                         
                         Releases 
                            Y1 - para corrigir as ellipses do Y1 deve multiplicar o valor de theta_image 
                            por -1. para todas as linhas. 
                            
                            Y3 - a correcao do Y3 e: 90 - theta_image. 
                            
                            Glauber: 21/12/2017 - O Release publico DR1 Main deve ser tratado  
                            igual ao Y3.
                            
                            NAO foi testado outros releases por nao estarem registrados as suas tabelas coadd.
                        """
                        if meta_prop == '_meta_theta_image':
                            t_image = float(value)

                            # Descobrir o release do Catalogo
                            release_set = catalog.productrelease_set.first()
                            if release_set:
                                release = release_set.release.rls_name
                                # Se tiver release e ele for o Y3 subtrair 90 graus
                                areleases = ['y3a1_coadd', 'y6a1_coadd', 'y6a2_coadd', 'dr1', 'dr2']
                                if release in areleases:
                                    t_image = 90 - t_image

                                else:
                                    t_image = t_image * -1
                            else:
                                t_image = t_image * -1

                            value = t_image

                        row.update({
                            meta_prop: value
                        })

                    # print("%s:%s" % (meta_prop, value))

                except:
                    pass
        return Response(dict({
            'count': count,
            'results': rows
        }))

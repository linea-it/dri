import logging
import math
import numpy as np
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

    filterset_fields = ('id', 'catalog_id', 'owner', 'object_id', 'rating')

    ordering_fields = ('id',)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user.pk)


class RejectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Reject to be viewed or edited
    """
    queryset = Reject.objects.all()

    serializer_class = RejectSerializer

    filterset_fields = ('id', 'catalog_id', 'owner', 'object_id', 'reject')

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

    filterset_fields = ('id', 'catalog_id', 'owner', 'object_id', 'comments')

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
        if catalog_db.get_engine_name() == "oracle":
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
                if isinstance(row.get(prop, None), float) or isinstance(row.get(prop, None), int):
                    # Check if is infity
                    if math.isinf(row.get(prop)):
                        if row.get(prop) > 0:
                            row.update({prop: "+Infinity"})
                        elif row.get(prop) < 0:
                            row.update({prop: "-Infinity"})

                    # Fixed in Issue: https://github.com/linea-it/dri/issues/1489
                    # Check if is NaN
                    if math.isnan(float(row.get(prop))):
                        row.update({prop: "nan"})

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

        # Parametro para retornar todas as colunas.
        all_columns = request.query_params.get('all_columns', True)

        all_columns = False if all_columns in ['false', '0', 'f', 'False', 'no'] else True

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        # colunas associadas ao produto
        associations = Association().get_associations_by_product_id(product_id)

        columns = list()
        if not all_columns:
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
                        value = row.get(associations.get(ucd))

                        # TODO: Esse tratamento do theta image deveria ser uma flag no cadastro do Produto.
                        """Releases 
                            Y1 - para corrigir as ellipses do Y1 deve multiplicar o valor de theta_image 
                            por -1. para todas as linhas. 
                            
                            Os demais releases a partir do Y3 
                            Y3 - a correcao do Y3 é: 90 - theta_image. 
                        """
                        if meta_prop == '_meta_theta_image':
                            t_image = float(value)

                            # Decobrir o release do produto
                            release_set = catalog.productrelease_set.first()
                            if release_set:
                                # Se o produto estiver associado a um release.
                                # Verifica se é o release do Y1
                                areleases = ['y1_wide_survey', 'y1_supplemental_d04', 'y1_supplemental_d10', 'y1_supplemental_dfull']

                                # é usado o internal name do release para fazer a checagem.
                                if release_set.release.rls_name in areleases:
                                    # Para releases do Y1 aplica multiplica por -1
                                    t_image = t_image * -1
                                else:
                                    # Demais releases utiliza 90 - theta_image
                                    t_image = 90 - t_image
                            else:
                                # Produto não está associado a nenhum release
                                # Usa a correção que atende a maior parte dos catalogos.
                                t_image = 90 - t_image

                            value = t_image

                        row.update({
                            meta_prop: value
                        })

                except:
                    pass
            # FIXED Issue: https: // github.com / linea - it / dri / issues / 1153
            # Ticket: http: // ticket.linea.gov.br / ticket / 11761
            for prop in row:
                if isinstance(row.get(prop, None), float) or isinstance(row.get(prop, None), int):
                    # Check if is infity
                    if math.isinf(row.get(prop)):
                        if row.get(prop) > 0:
                            row.update({prop: "+Infinity"})
                        elif row.get(prop) < 0:
                            row.update({prop: "-Infinity"})

                    # Fixed in Issue: https://github.com/linea-it/dri/issues/1489
                    # Check if is NaN
                    if math.isnan(float(row.get(prop))):
                        row.update({prop: "nan"})


        return Response(dict({
            'count': count,
            'results': rows
        }))

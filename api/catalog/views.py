from django.conf import settings
from lib.CatalogDB import TargetObjectsDBHelper, CatalogObjectsDBHelper
from product.association import Association
from product.models import Catalog, ProductContentAssociation
from product.serializers import AssociationSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import Rating, Reject, Comments
from .serializers import RatingSerializer, RejectSerializer, CommentsSerializer


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
        serializer.save(owner=self.request.user.pk)


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

        print(associations)

        # Recuperar no Settigs em qual schema do database estao as tabelas de rating e reject
        schema_rating_reject = settings.SCHEMA_RATING_REJECT

        catalog_db = TargetObjectsDBHelper(
            table=catalog.tbl_name,
            schema=catalog.tbl_schema,
            database=catalog.tbl_database,
            associations=associations,
            schema_rating_reject=schema_rating_reject,
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
                "_meta_rating_id": None,
                "_meta_rating": None,
                "_meta_reject_id": None,
                "_meta_reject": None,
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

            row.update({
                "_meta_rating_id": row.get('meta_rating_id', None)
            })
            row.update({
                "_meta_rating": row.get('meta_rating', None)
            })
            row.update({
                "_meta_reject_id": row.get('meta_reject_id', None)
            })
            row.update({
                "_meta_reject": bool(row.get('meta_reject', None))
            })

            row.pop("meta_rating_id", None)
            row.pop("meta_rating", None)
            row.pop("meta_reject_id", None)
            row.pop("meta_reject", None)

            # Count de Comentarios por objetos.
            # TODO: utlizar um join com having count ao inves de uma query para cada linha

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
                                if release == 'y3a1_coadd' or release == 'dr1':
                                    t_image = 90 - t_image

                                else:
                                    t_image = t_image * -1
                            else:
                                t_image = t_image * -1

                            value = t_image

                        row.update({
                            meta_prop: value
                        })

                except:
                    pass
        return Response(dict({
            'count': count,
            'results': rows
        }))

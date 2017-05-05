from lib.CatalogDB import CatalogDB
from product.models import Catalog, ProductContent, ProductContentAssociation
from product.serializers import AssociationSerializer

from rest_framework import viewsets
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.viewsets import ViewSet
from .models import Rating, Reject
from .models import Reject
from .serializers import RatingSerializer, RejectSerializer
from rest_framework.permissions import AllowAny
import csv


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


class TargetViewSet(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of targets in catalog.
        """

        print("0 #################################################")
        # Recuperar o parametro product id que e obrigatorio
        product_id = request.query_params.get('product', None)
        if not product_id:
            raise Exception('Product parameter is missing.')

        # Recuperar no model Catalog pelo id passado na url
        catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)

        if not catalog:
            raise Exception('No product found for this id.')

        if catalog.tbl_database is not None:
            db = CatalogDB(db=catalog.tbl_database)
        else:
            db = CatalogDB()

        # Com o modelo catalog em maos deve ter um atributo para schema e tabela esses atributos estao descritos no
        # model table.
        schema = catalog.tbl_schema
        table = catalog.tbl_name
        if schema is not None:
            table = "%s.%s" %(schema, table)

        print("1 #################################################")
        # colunas associadas ao produto
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()

        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        property_id = properties.get("meta.id;meta.main", None)

        # Todas as colunas de catalogo.
        columns = list()
        queryset = ProductContent.objects.filter(pcn_product_id=catalog)
        for row in queryset:
            columns.append(row.pcn_column_name)

        if not property_id:
            property_id = columns[0]

        # Parametros de Paginacao
        limit = request.query_params.get('limit', None)
        start = request.query_params.get('offset', None)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # Parsing para os campos de rating e reject
        if ordering == '_meta_rating':
            ordering = 'b.rating'
        elif ordering == '-_meta_rating':
            ordering = '-b.rating'
        elif ordering == '_meta_reject':
            ordering = 'c.reject'
        elif ordering == '-_meta_reject':
            ordering = '-c.reject'

        # retornar uma lista com os objetos da tabela
        rows = list()

        owner = request.user.pk

        rows, count = db.wrapper.query(
            table,
            limit=limit,
            offset=start,
            order_by=ordering,
            joins=list([dict({
                'operation': 'LEFT',
                'tablename': 'catalog_rating',
                'alias': 'b',
                'condition': 'a.%s = b.object_id AND b.owner = %s  AND b.catalog_id = %s' % (
                property_id, owner, product_id),
                'columns': list(['id meta_rating_id', 'rating meta_rating'])
            }), dict({
                'operation': 'LEFT',
                'tablename': 'catalog_reject',
                'alias': 'c',
                'condition': 'a.%s = c.object_id AND c.owner = %s  AND c.catalog_id = %s' % (
                property_id, owner, product_id),
                'columns': list(['id meta_reject_id', 'reject meta_reject'])
            })])
        )

        for row in rows:

            if 'META_RATING_ID' in row:
                rating_id = row.get('META_RATING_ID')
                rating = row.get('META_RATING')
                reject_id = row.get('META_REJECT_ID', 0)
                reject = row.get('META_REJECT', False)
            elif 'meta_rating_id' in row:
                rating_id = row.get('meta_rating_id')
                rating = row.get('meta_rating')
                reject_id = row.get('meta_reject_id', 0)
                reject = row.get('meta_reject', False)
            else:
                rating_id = None
                rating = None
                reject_id = None
                reject = None

            if reject_id is not None:
                reject_id = int(reject_id)
                reject = True
            else:
                reject = False

            row.update({
                "_meta_catalog_id": catalog.pk,
                "_meta_is_system": catalog.prd_class.pcl_is_system,
                "_meta_id": '',
                "_meta_ra": 0,
                "_meta_dec": 0,
                "_meta_radius": 0,
                "_meta_rating_id": rating_id,
                "_meta_rating": rating,
                "_meta_reject_id": reject_id,
                "_meta_reject": reject,
            })

            row.pop("META_RATING_ID", None)
            row.pop("meta_rating_id", None)
            row.pop("META_RATING", None)
            row.pop("meta_rating", None)
            row.pop("META_REJECT_ID", None)
            row.pop("meta_reject_id", None)
            row.pop("META_REJECT", None)
            row.pop("meta_reject", None)

            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main"))
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            })
            row.update({
                "_meta_radius": row.get(properties.get("phys.angSize;src"))
            })

        return Response(dict({
            'count': count,
            'results': rows
        }))


class VisiomaticCoaddObjects(ViewSet):
    """

    """
    # permission_classes = (AllowAny,)

    def list(self, request):
        """
        Return a list of coadd objects for visiomatic.
        """
        # Recuperar o parametro product id ou sorce e obrigatorio
        product_id = request.query_params.get('product', None)
        source = request.query_params.get('source', None)
        if product_id is not None:
            # Recuperar no model Catalog pelo id passado na url
            catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        elif source is not None:
            catalog = Catalog.objects.select_related().get(prd_name=source)
        else:
            raise Exception('Product id or source is mandatory.')

        if not catalog:
            raise Exception('No product found.')

        if catalog.tbl_database is not None:
            com = CatalogDB(db=catalog.tbl_database)
        else:
            com = CatalogDB()

        db = com.wrapper

        # tablename
        # Verifica se a tabela existe
        if not db.table_exists(catalog.tbl_schema, catalog.tbl_name):
            raise Exception("Table or view  %s.%s does not exist" % (catalog.tbl_schema, catalog.tbl_name))

        # Parametros de Paginacao
        limit = request.query_params.get('limit', 1000)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # Parametros de Retorno
        mime = request.query_params.get('mime', 'json')

        # Parametro Columns
        pcolumns = request.query_params.get('columns', None)
        columns = None
        if pcolumns is not None:
            acolumns = pcolumns.split(',')
            if len(acolumns) > 0:
                columns = acolumns

        coordinate = request.query_params.get('coordinate', None).split(',')
        bounding = request.query_params.get('bounding', None).split(',')
        maglim = request.query_params.get('maglim', None)

        filters = list()
        if coordinate and bounding:
            ra = float(coordinate[0])
            dec = float(coordinate[1])
            bra = float(bounding[0])
            bdec = float(bounding[1])
            filters.append(
                dict({
                    "operator": "AND",
                    "conditions": list([
                        dict({
                            "property": "RA",
                            "operator": "between",
                            "value": list([ra - bra, ra + bra])
                        }),
                        dict({
                            "property": "DEC",
                            "operator": "between",
                            "value": list([dec - bdec, dec + bdec])
                        })
                    ])
                })
            )

        if maglim is not None:
            maglim = float(maglim)
            mag = 'MAG_AUTO_I'
            filters.append(
                dict({
                    "property": mag,
                    "operator": "<=",
                    "value": maglim
                })
            )

        # retornar uma lista com os objetos da tabela
        rows = list()

        owner = request.user.pk

        rows, count = db.query(
            schema=catalog.tbl_schema,
            table=catalog.tbl_name,
            columns=columns,
            filters=filters,
            limit=limit,
            order_by=ordering,
            return_count=False,
        )

        if mime == 'json':
            return Response(rows)

        elif mime == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'inline'

            writer = csv.writer(response)
            for row in rows:

                r = list()
                for col in columns:
                    value = row.get(col)
                    if isinstance(value, float):
                        value = float(format(value, '.4f'))
                    r.append(value)

                writer.writerow(r)

            return response

        else:
            pass

class CoaddObjects(ViewSet):
    """

    """

    def list(self, request):
        """
        Return a list of coadd objects.
        """
        # Recuperar o parametro product id ou sorce e obrigatorio
        product_id = request.query_params.get('product', None)
        source = request.query_params.get('source', None)
        if product_id is not None:
            # Recuperar no model Catalog pelo id passado na url
            catalog = Catalog.objects.select_related().get(product_ptr_id=product_id)
        elif source is not None:
            catalog = Catalog.objects.select_related().get(prd_name=source)
        else:
            raise Exception('Product id or source is mandatory.')

        if not catalog:
            raise Exception('No product found.')

        if catalog.tbl_database is not None:
            com = CatalogDB(db=catalog.tbl_database)
        else:
            com = CatalogDB()

        db = com.wrapper

        # tablename
        # Verifica se a tabela existe
        if not db.table_exists(catalog.tbl_schema, catalog.tbl_name):
            raise Exception("Table or view  %.%s does not exist" % (catalog.tbl_schema, catalog.tbl_name))

        # Parametros de Paginacao
        limit = request.query_params.get('limit', 1000)
        start = request.query_params.get('offset', None)

        # Parametros de Ordenacao
        ordering = request.query_params.get('ordering', None)

        # Parametro Columns
        pcolumns = request.query_params.get('columns', None)
        columns = None
        if pcolumns is not None:
            acolumns = pcolumns.split(',')
            if len(acolumns) > 0:
                columns = acolumns


        coordinate = request.query_params.get('coordinate', None)
        if coordinate is not None:
            coordinate = coordinate.split(',')
        bounding = request.query_params.get('bounding', None)
        if bounding is not None:
            bounding = bounding.split(',')
        maglim = request.query_params.get('maglim', None)

        coadd_object_id = request.query_params.get('coadd_object_id', None)


        # Antes de criar os filtros para a query verificar se o catalogo tem associacao e descobrir as
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=catalog.pk)
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()
        # propriedades corretas
        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({property.get('pcc_ucd'): property.get('pcn_column_name')})

        property_id = properties.get("meta.id;meta.main", None)
        property_ra = properties.get("pos.eq.ra;meta.main", None)
        property_dec = properties.get("pos.eq.dec;meta.main", None)

        filters = list()
        if coordinate and bounding:
            ra = float(coordinate[0])
            dec = float(coordinate[1])
            bra = float(bounding[0])
            bdec = float(bounding[1])
            filters.append(
                dict({
                    "operator": "AND",
                    "conditions": list([
                        dict({
                            "property": property_ra,
                            "operator": "between",
                            "value": list([ra - bra, ra + bra])
                        }),
                        dict({
                            "property": property_dec,
                            "operator": "between",
                            "value": list([dec - bdec, dec + bdec])
                        })
                    ])
                })
            )

        if maglim is not None:
            # TODO a magnitude continua com a propriedade hardcoded
            maglim = float(maglim)
            mag = 'MAG_AUTO_I'
            filters.append(
                dict({
                    "property": mag,
                    "operator": "<=",
                    "value": maglim
                })
            )

        if coadd_object_id is not None:
            filters.append(
                dict({
                    "property": property_id,
                    "operator": '=',
                    "value": int(coadd_object_id)
                })
            )

        if len(filters) == 0:
            filters = None

        # retornar uma lista com os objetos da tabela
        rows = list()

        owner = request.user.pk

        rows, count = db.query(
            schema=catalog.tbl_schema,
            table=catalog.tbl_name,
            columns=columns,
            filters=filters,
            limit=limit,
            offset=start,
            order_by=ordering
        )

        for row in rows:
            row.update({
                "_meta_id": row.get(properties.get("meta.id;meta.main"))
            })
            row.update({
                "_meta_ra": row.get(properties.get("pos.eq.ra;meta.main"))
            })
            row.update({
                "_meta_dec": row.get(properties.get("pos.eq.dec;meta.main"))
            })


        return Response(rows)

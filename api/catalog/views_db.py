import json
import warnings

from lib.CatalogDB import CatalogDB
from lib.CatalogDB import DBBase
from sqlalchemy import desc
from sqlalchemy import exc as sa_exc
from sqlalchemy.sql import select, and_, or_
from sqlalchemy.sql.expression import literal_column, between


class CoaddObjectsDBHelper:
    def __init__(self, table, schema=None, database=None):
        self.schema = schema

        if database:
            com = CatalogDB(db=database)
        else:
            com = CatalogDB()

        self.db = com.database
        if not self.db.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" %
                            (self.schema, table))

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            self.table = self.db.get_table_obj(table, schema=self.schema)
            self.str_columns = None

    @staticmethod
    def _is_coordinate_and_bounding_defined(params, properties):
        if params.get('coordinate') and \
                params.get('bounding') and \
                properties.get("pos.eq.ra;meta.main") and \
                properties.get("pos.eq.dec;meta.main"):
            return True
        return False

    def make_coordinate_and_bounding_filters(self, params, properties):
        if not CoaddObjectsDBHelper._is_coordinate_and_bounding_defined(
                params, properties):
            raise ("Coordinate and bounding filters are not defined.")

        coordinate = params.get('coordinate', None).split(',')
        bounding = params.get('bounding', None).split(',')

        property_ra = properties.get("pos.eq.ra;meta.main", None).lower()
        property_ra_t = DBBase.get_column_obj(self.table, property_ra)

        property_dec = properties.get("pos.eq.dec;meta.main", None).lower()
        property_dec_t = DBBase.get_column_obj(self.table, property_dec)

        ra = float(coordinate[0])
        dec = float(coordinate[1])
        bra = float(bounding[0])
        bdec = float(bounding[1])

        _filters = list()
        _filters.append(between(literal_column(str(property_ra_t)),
                                literal_column(str(ra - bra)),
                                literal_column(str(ra + bra))))
        _filters.append(between(literal_column(str(property_dec_t)),
                                literal_column(str(dec - bdec)),
                                literal_column(str(dec + bdec))))
        return and_(*_filters)

    def _create_stm(self, params, properties):
        # Parametros de Paginacao
        limit = params.get('limit', 1000)
        start = params.get('offset', None)

        # Parametros de Ordenacao
        ordering = params.get('ordering', None)

        # Parametro Columns
        columns = list()
        self.str_columns = params.get('columns', None)
        if self.str_columns is not None:
            self.str_columns = self.str_columns.split(',')
            columns = DBBase.create_columns_sql_format(self.table, self.str_columns)
        else:
            columns = self.table.columns

        filters = list()
        if CoaddObjectsDBHelper._is_coordinate_and_bounding_defined(
                params, properties):
            filters.append(self.make_coordinate_and_bounding_filters(
                params, properties))

        maglim = params.get('maglim', None)
        if maglim is not None:
            # TODO a magnitude continua com a propriedade hardcoded
            maglim = float(maglim)
            mag_t = DBBase.get_column_obj(self.table, 'mag_auto_i')
            filters.append(
                literal_column(str(mag_t)) <= literal_column(str(maglim)))

        coadd_object_id = params.get('coadd_object_id', None)
        property_id = properties.get("meta.id;meta.main", None).lower()
        property_id_t = DBBase.get_column_obj(self.table, property_id)
        if coadd_object_id is not None:
            filters.append(
                literal_column(str(property_id_t)) ==
                literal_column(str(coadd_object_id)))
        stm = select(columns).select_from(self.table).where(and_(*filters))

        if limit:
            stm = stm.limit(literal_column(str(limit)))
        if start:
            stm = stm.offset(literal_column(str(start)))

        return stm

    def query_result(self, params, properties):
        stm = self._create_stm(params, properties)
        return self.db.fetchall_dict(stm)


class TargetViewSetDBHelper(CatalogDB):
    def __init__(self, table, schema=None, database=None):

        super(TargetViewSetDBHelper, self).__init__(db=database)

        self.schema_rating_reject = None

        if not self.db.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" %
                            (self.schema, table))

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            table = self.db.get_table_obj(table, schema=self.schema)
            # Nome das colunas originais na tabela
            self.columns = [column.key for column in table.columns]

            self.table = table.alias('a')

    def _create_stm(self, request, properties):
        params = request.query_params
        owner = request.user.pk

        product_id = request.query_params.get('product', None)
        try:
            property_id = properties.get("meta.id;meta.main").lower()
        except:
            raise ("Need association for ID column with meta.id;meta.main ucd.")

        catalog_rating_id = self.db.get_table_obj('catalog_rating', schema=self.schema_rating_reject).alias('b')
        catalog_reject_id = self.db.get_table_obj('catalog_reject', schema=self.schema_rating_reject).alias('c')

        stm_join = self.table
        stm_join = stm_join.join(catalog_rating_id,
                                 DBBase.get_column_obj(self.table, property_id) ==
                                 catalog_rating_id.c.object_id, isouter=True)
        stm_join = stm_join.join(catalog_reject_id,
                                 or_(DBBase.get_column_obj(self.table, property_id) ==
                                 catalog_reject_id.c.object_id, catalog_reject_id.c.id.is_(None)), isouter=True)

        stm = select([self.table,
                      catalog_rating_id.c.id.label('meta_rating_id'),
                      catalog_rating_id.c.rating.label('meta_rating'),
                      catalog_reject_id.c.id.label('meta_reject_id'),
                      catalog_reject_id.c.reject.label('meta_reject')]). \
            select_from(stm_join)

        # Filtros
        filters = list()
        rating_filter = list()
        reject_filters = ''
        coordinates_filter = list()
        reject_query = True
        params = params.dict()
        for param in params:
            if '__' in param:
                col, op = param.split('__')
            else:
                col = param
                op = 'eq'

            if col.lower() in self.columns:
                filters.append(dict(
                    column=col.lower(),
                    op=op,
                    value=params.get(param)))
            else:
                if col == '_meta_rating':
                    rating_filter = list([dict(
                        column='rating',
                        op=op,
                        value=params.get(param))])
                elif col == '_meta_reject':
                    reject_filters = or_(catalog_reject_id.c.reject.is_(None), catalog_reject_id.c.reject == 0)
                    if params.get(param) in ['True', 'true', '1', 't', 'y', 'yes']:
                        reject_filters = catalog_reject_id.c.reject == 1
                # Coordenadas query por quadrado
                elif col == 'coordinates':
                    value = json.loads(params.get(param))
                    # Upper Right
                    ur = value[0]
                    # Lower Left
                    ll = value[1]
                    coordinates_filter.append(
                        and_(between(
                            literal_column(str('ra')),
                            literal_column(str(ll[0])),
                            literal_column(str(ur[0]))
                        ), between(
                            literal_column(str('dec')),
                            literal_column(str(ll[1])),
                            literal_column(str(ur[1]))
                        ))
                    )
        rating_filters = and_(*DBBase.do_filter(self.table, filters) +
                              DBBase.do_filter(catalog_rating_id, rating_filter) +
                              coordinates_filter)
        stm = stm.where(and_(rating_filters, reject_filters))

        print(str(stm))

        # Parametros de Paginacao
        limit = params.get('limit', None)
        start = params.get('offset', None)

        if limit:
            stm = stm.limit(literal_column(str(limit)))

        if start:
            stm = stm.offset(literal_column(str(start)))

        # Parametros de Ordenacao
        ordering = params.get('ordering', None)

        if ordering is not None:
            asc = True
            property = ordering.lower()

            if ordering[0] == '-':
                asc = False
                property = ordering[1:].lower()

            if property == '_meta_rating':
                property = catalog_rating_id.c.rating
            elif property == '_meta_reject':
                property = catalog_reject_id.c.reject
            else:
                property = 'a.' + property

            if asc:
                stm = stm.order_by(property)
            else:
                stm = stm.order_by(desc(property))

        return stm

    def query_result(self, request, properties):
        stm = self._create_stm(request, properties)

        result = self.db.fetchall_dict(stm)

        count = self.db.stm_count(stm)

        return result, count



class CatalogObjectsViewSetDBHelper:
    def __init__(self, table, schema=None, database=None, columns=list(), limit=None, start=None):
        self.schema = schema
        self.query_columns = list()
        self.limit = limit
        self.start = start


        if database:
            com = CatalogDB(db=database)

        else:
            com = CatalogDB()

        self.db = com.database
        if not self.db.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" %
                            (self.schema, table))

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            table = self.db.get_table_obj(table, schema=self.schema)

            # Nome das colunas originais na tabela
            self.columns = [column.key.strip() for column in table.columns]

            if len(columns) > 0:
                for col in columns:
                    if col in self.columns:
                        self.query_columns.append(literal_column(str(col)))

            else:
                self.query_columns = self.columns

            self.table = table.alias('a')

    def _create_stm(self, request, properties):
        params = request.query_params
        owner = request.user.pk

        product_id = request.query_params.get('product', None)
        try:
            property_id = properties.get("meta.id;meta.main").lower()
        except:
            raise ("Need association for ID column with meta.id;meta.main ucd.")

        # Aqui pode entrar o parametro para escolher as colunas
        stm = select(self.query_columns).select_from(self.table)

        # Filtros
        filters = list()
        coordinates_filter = list()

        params = params.dict()
        for param in params:
            if '__' in param:
                col, op = param.split('__')
                if op == 'gte':
                    op = 'ge'
                if op == 'lte':
                    op = 'le'
            else:
                col = param
                op = 'eq'

            if col.lower() in self.columns:
                filters.append(dict(
                    column=col.lower(),
                    op=op,
                    value=params.get(param)))
            else:
                # Coordenadas query por quadrado
                if col == 'coordinates':
                    value = json.loads(params.get(param))
                    # Upper Right
                    ur = value[0]
                    # Lower Left
                    ll = value[1]
                    coordinates_filter.append(
                        and_(between(
                            literal_column(str('ra')),
                            literal_column(str(ll[0])),
                            literal_column(str(ur[0]))
                        ), between(
                            literal_column(str('dec')),
                            literal_column(str(ll[1])),
                            literal_column(str(ur[1]))
                        ))
                    )

        stm = stm.where(and_(*DBBase.do_filter(self.table, filters) +
                              coordinates_filter
                             ))

        print(str(stm))

        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        return stm


    def query_result(self, request, properties):
        stm = self._create_stm(request, properties)

        result = self.db.fetchall_dict(stm)

        count = self.db.stm_count(stm)

        return result, count

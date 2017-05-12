from lib.CatalogDB import CatalogDB
from lib.CatalogDB import DBBase

from sqlalchemy.sql.expression import literal_column, between
from sqlalchemy.sql import select, and_
from sqlalchemy import desc


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

        self.table = self.db.get_table_obj(table, schema=self.schema)
        self.str_columns = None

    @staticmethod
    def _is_coordinate_and_bounding_defined(params, properties):
        if params.get('coordinate') and\
                params.get('bounding') and\
                properties.get("pos.eq.ra;meta.main") and\
                properties.get("pos.eq.dec;meta.main"):
            return True
        return False

    def make_coordinate_and_bounding_filters(self, params, properties):
        if not CoaddObjectsDBHelper._is_coordinate_and_bounding_defined(
                    params, properties):
            raise("Coordinate and bounding filters are not defined.")

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
        self.str_columns = params.get('columns', None)
        if self.str_columns is not None:
            self.str_columns = self.str_columns.split(',')
        columns = DBBase.create_columns_sql_format(self.table, self.str_columns)

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
        return self.db.fetchall_dict(stm, self.str_columns)


class VisiomaticCoaddObjectsDBHelper:
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

        self.table = self.db.get_table_obj(table, schema=self.schema)
        self.columns = None

    def _create_stm(self, params):
        # Parametros de Paginacao
        limit = params.get('limit', 1000)

        # Parametros de Ordenacao
        ordering = params.get('ordering', None)

        # Parametro Columns
        self.str_columns = params.get('columns', None)
        if self.str_columns is not None:
            self.str_columns = self.str_columns.split(',')
        columns = DBBase.create_columns_sql_format(self.table, self.str_columns)

        coordinate = params.get('coordinate', None).split(',')
        bounding = params.get('bounding', None).split(',')

        filters = list()
        if coordinate and bounding:
            property_ra_t = DBBase.get_column_obj(self.table, 'ra')
            property_dec_t = DBBase.get_column_obj(self.table, 'dec')

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
            filters.append(and_(*_filters))

        maglim = params.get('maglim', None)
        if maglim is not None:
            # TODO a magnitude continua com a propriedade hardcoded
            maglim = float(maglim)
            mag_t = DBBase.get_column_obj(self.table, 'mag_auto_i')
            filters.append(
                literal_column(str(mag_t)) <= literal_column(str(maglim)))

        stm = select(columns).select_from(self.table).where(and_(*filters))

        if limit:
            stm = stm.limit(literal_column(str(limit)))

        return stm

    def query_result(self, params):
        stm = self._create_stm(params)
        return self.db.fetchall_dict(stm, self.str_columns)


class TargetViewSetDBHelper:
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

        self.table = self.db.get_table_obj(table, schema=self.schema).alias('a')
        self.columns = None

    def _create_stm(self, request, properties, catalog_columns):
        params = request.query_params
        owner = request.user.pk

        product_id = request.query_params.get('product', None)
        property_id = properties.get("meta.id;meta.main", None).lower()

        if not property_id:
            property_id = catalog_columns[0]

        # Parametros de Paginacao
        limit = params.get('limit', None)
        start = params.get('offset', None)

        # Parametros de Ordenacao
        ordering = params.get('ordering', None)

        # Filters TODO - condition?
        filters = list()
        params = params.dict()
        for p in params:
            if p in catalog_columns:
                filters.append(dict(
                    column=p.lower(),
                    op='eq',
                    value=params.get(p)))
            else:
                if '__' in p:
                    col, op = p.split('__')
                    if col in catalog_columns:
                        filters.append(dict(
                            column=col.lower(),
                            op=op,
                            value=params.get(p)))



        catalog_rating_id = self.db.get_table_obj('catalog_rating', schema=self.schema).alias('b')
        catalog_reject_id = self.db.get_table_obj('catalog_reject', schema=self.schema).alias('c')

        stm_join = self.table
        stm_join = stm_join.join(catalog_rating_id,
                                 DBBase.get_column_obj(self.table, property_id) ==
                                 catalog_rating_id.c.object_id, isouter=True)
        stm_join = stm_join.join(catalog_reject_id,
                                 DBBase.get_column_obj(self.table, property_id) ==
                                 catalog_reject_id.c.object_id, isouter=True)

        self.str_columns = ['meta_rating_id', 'meta_rating', 'meta_reject_id', 'meta_reject']
        stm = select([catalog_rating_id.c.id.label('meta_rating_id'),
                      catalog_rating_id.c.rating.label('meta_rating'),
                      catalog_reject_id.c.id.label('meta_reject_id'),
                      catalog_reject_id.c.reject.label('meta_reject')]).\
            select_from(stm_join)

        if limit:
            stm = stm.limit(literal_column(str(limit)))
        if start:
            stm = stm.offset(literal_column(str(start)))

        if ordering == '_meta_rating':
            stm = stm.order_by(catalog_rating_id.c.rating)
        elif ordering == '-_meta_rating':
            stm = stm.order_by(desc(catalog_rating_id.c.rating))
        elif ordering == '_meta_reject':
            stm = stm.order_by(catalog_reject_id.c.reject)
        elif ordering == '-_meta_reject':
            stm = stm.order_by(desc(catalog_reject_id.c.reject))

        stm = stm.where(and_(*DBBase.do_filter(self.table, filters)))
        return stm

    def query_result(self, request, properties, catalog_columns):
        stm = self._create_stm(request, properties, catalog_columns)
        return self.db.fetchall_dict(stm, self.str_columns)

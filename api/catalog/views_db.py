from lib.CatalogDB import CatalogDB

from sqlalchemy.sql.expression import literal_column, between
from sqlalchemy.sql import select, and_


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

    def _create_columns_sql_format(self, columns):
        t_columns = self.table
        if columns is not None:
            t_columns = list()
            for col in columns:
                t_columns.append(self.db.get_column_obj(self.table, col))
        return t_columns

    @staticmethod
    def _is_coordinate_and_bounding_defined(params, properties):
        if params.get('coordinate') and params.get('bounding') and\
            (properties.get("pos.eq.ra;meta.main") or
                properties.get("pos.eq.dec;meta.main")):
            return True
        return False

    def make_coordinate_and_bounding_filters(self, params, properties):
        if not CoaddObjectsDBHelper._is_coordinate_and_bounding_defined(params, properties):
            raise("Coordinate and bounding filters are not defined.")

        coordinate = params.get('coordinate', None).split(',')
        bounding = params.get('bounding', None).split(',')

        property_ra = properties.get("pos.eq.ra;meta.main", None)
        if property_ra:
            property_ra = property_ra.lower()
            property_ra_t = self.db.get_column_obj(self.table, property_ra)

        property_dec = properties.get("pos.eq.dec;meta.main", None)
        if property_dec:
            property_dec = property_dec.lower()
            property_dec_t = self.db.get_column_obj(self.table, property_dec)

        ra = float(coordinate[0])
        dec = float(coordinate[1])
        bra = float(bounding[0])
        bdec = float(bounding[1])

        _filters = list()
        if property_ra:
            _filters.append(between(literal_column(str(property_ra_t)),
                                    literal_column(str(ra - bra)),
                                    literal_column(str(ra + bra))))
        if property_dec:
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
        columns = self._create_columns_sql_format(self.str_columns)

        filters = list()
        if CoaddObjectsDBHelper._is_coordinate_and_bounding_defined(params, properties):
            filters.append(self.make_coordinate_and_bounding_filters(params, properties))

        maglim = params.get('maglim', None)
        if maglim is not None:
            # TODO a magnitude continua com a propriedade hardcoded
            maglim = float(maglim)
            mag_t = self.db.get_column_obj(self.table, 'mag_auto_i')
            filters.append(
                literal_column(str(mag_t) <= literal_column(maglim))
            )

        coadd_object_id = params.get('coadd_object_id', None)
        property_id = properties.get("meta.id;meta.main", None).lower()
        property_id_t = self.db.get_column_obj(self.table, property_id)
        if coadd_object_id is not None:
            filters.append(
                literal_column(str(property_id_t) ==
                               literal_column(str(coadd_object_id)))
            )

        stm = select(columns).select_from(self.table)

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

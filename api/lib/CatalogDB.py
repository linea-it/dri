import warnings

from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy import Column
from sqlalchemy import exc as sa_exc
from sqlalchemy.sql import select, and_
from sqlalchemy.sql.expression import literal_column, between


class CatalogDB:
    def __init__(self, db='catalog'):
        if db is None or db == "":
            db = 'catalog'

        conn_parameters = DBBase.prepare_connection(db)
        self.db = DBBase(conn_parameters)

        self.schema = None


class CatalogObjectsDBHelper(CatalogDB):
    def __init__(self, table, schema=None, database=None, columns=list(), filters=None, limit=None, start=None):

        super(CatalogObjectsDBHelper, self).__init__(db=database)

        self.query_columns = list()
        self.filters = list()
        self.limit = limit
        self.start = start

        if not self.db.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" %
                            (self.schema, table))

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            table = self.db.get_table_obj(table, schema=self.schema)

            # Nome das colunas originais na tabela
            self.columns = [Column(column.key.strip()) for column in table.columns]

            if len(columns) > 0:
                for col in columns:
                    if col in self.columns:
                        self.query_columns.append(Column(col))

            else:
                self.query_columns = self.columns

            self.table = table

        if filters is not None and len(filters) > 0:
            # Esse Filtros devem estar no formato SqlAlchemy
            # {
            #   column: <nome da coluna>,
            #   op: <operador>
            #   value: <valor>
            # }
            for condition in filters:
                self.filters.append(condition)


    def create_stm(self, query_params=None):
        # Aqui pode entrar o parametro para escolher as colunas
        stm = select(self.query_columns).select_from(self.table)

        # Filtros
        filters = list()
        coordinates_filter = list()

        if self.filters is not None and len(self.filters) > 0:
            filters = self.filters

        # elif query_params is not None:
        #     params = query_params.dict()
        #     for param in params:
        #         if '__' in param:
        #             col, op = param.split('__')
        #             if op == 'gte':
        #                 op = 'ge'
        #             if op == 'lte':
        #                 op = 'le'
        #         else:
        #             col = param
        #             op = 'eq'
        #
        #         if col.lower() in self.columns:
        #             filters.append(dict(
        #                 column=col.lower(),
        #                 op=op,
        #                 value=params.get(param)))
        #         else:
        #             # Coordenadas query por quadrado
        #             if col == 'coordinates':
        #                 value = json.loads(params.get(param))
        #                 # Upper Right
        #                 ur = value[0]
        #                 # Lower Left
        #                 ll = value[1]
        #                 coordinates_filter.append(
        #                     and_(between(
        #                         Column(str('ra')),
        #                         Column(str(ll[0])),
        #                         Column(str(ur[0]))
        #                     ), between(
        #                         Column(str('dec')),
        #                         Column(str(ll[1])),
        #                         Column(str(ur[1]))
        #                     ))
        #                 )

        stm = stm.where(and_(*DBBase.do_filter(self.table, filters) +
                              coordinates_filter
                             ))

        print(str(stm))

        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        return stm

    def query_result(self, query_params=None):
        stm = self._create_stm(query_params)

        result = self.db.fetchall_dict(stm)

        count = self.db.stm_count(stm)

        return result, count

# class TargetViewDBHelper(CatalogDB):
#     def __init__(self, table, schema=None, database='catalog'):
#         super(TargetViewDBHelper, self).__init__(db=database)
#
#         if schema is not None and schema is not "":
#             self.schema = schema
#
#         # Se o catalogo a ser lido nao esta no banco de dados de catalogo
#         # e necessario informar em qual esquema esta as tabelas de Rating e Reject
#         self.schema_rating_reject = None
#         if database:
#             if database is not 'catalog':
#                 try:
#                     self.schema_rating_reject = settings.SCHEMA_RATING_REJECT
#                 except:
#                     raise (
#                     "The table is in a different schema of the catalog database, the rating and reject tables are not available in this schema. To solve this add the variable SCHEMA_RATING_REJECT to the settings pointing to the schema where the rating and reject tables are available.")
#
#         else:
#             database = "catalog"
#
#         if not self.db.table_exists(table, schema=self.schema):
#             raise Exception("Table or view  %s.%s does not exist" %
#                             (self.schema, table))
#
#         # Desabilitar os warnings na criacao da tabela
#         with warnings.catch_warnings():
#             warnings.simplefilter("ignore", category=sa_exc.SAWarning)
#
#             table = self.db.get_table_obj(table, schema=self.schema)
#             # Nome das colunas originais na tabela
#             self.columns = [column.key.strip() for column in table.columns]
#
#             self.table = table.alias('a')
#
#     def create_stm(self):
#
#         print(" CREATE STATEMENT")
#         # params = request.query_params
#         # owner = request.user.pk
#         #
#         # product_id = request.query_params.get('product', None)
#         # try:
#         #     property_id = properties.get("meta.id;meta.main").lower()
#         # except:
#         #     raise ("Need association for ID column with meta.id;meta.main ucd.")
#         #
#         # catalog_rating_id = self.db.get_table_obj('catalog_rating', schema=self.schema_rating_reject).alias('b')
#         # catalog_reject_id = self.db.get_table_obj('catalog_reject', schema=self.schema_rating_reject).alias('c')
#         #
#         # stm_join = self.table
#         # stm_join = stm_join.join(catalog_rating_id,
#         #                          DBBase.get_column_obj(self.table, property_id) ==
#         #                          catalog_rating_id.c.object_id, isouter=True)
#         # stm_join = stm_join.join(catalog_reject_id,
#         #                          or_(DBBase.get_column_obj(self.table, property_id) ==
#         #                              catalog_reject_id.c.object_id, catalog_reject_id.c.id.is_(None)), isouter=True)
#         #
#         # stm = select([self.table,
#         #               catalog_rating_id.c.id.label('meta_rating_id'),
#         #               catalog_rating_id.c.rating.label('meta_rating'),
#         #               catalog_reject_id.c.id.label('meta_reject_id'),
#         #               catalog_reject_id.c.reject.label('meta_reject')]). \
#         #     select_from(stm_join)
#         #
#         # # Filtros
#         # filters = list()
#         # rating_filter = list()
#         # reject_filters = ''
#         # coordinates_filter = list()
#         # reject_query = True
#         # params = params.dict()
#         # for param in params:
#         #     if '__' in param:
#         #         col, op = param.split('__')
#         #     else:
#         #         col = param
#         #         op = 'eq'
#         #
#         #     if col.lower() in self.columns:
#         #         filters.append(dict(
#         #             column=col.lower(),
#         #             op=op,
#         #             value=params.get(param)))
#         #     else:
#         #         if col == '_meta_rating':
#         #             rating_filter = list([dict(
#         #                 column='rating',
#         #                 op=op,
#         #                 value=params.get(param))])
#         #         elif col == '_meta_reject':
#         #             reject_filters = or_(catalog_reject_id.c.reject.is_(None), catalog_reject_id.c.reject == 0)
#         #             if params.get(param) in ['True', 'true', '1', 't', 'y', 'yes']:
#         #                 reject_filters = catalog_reject_id.c.reject == 1
#         #         # Coordenadas query por quadrado
#         #         elif col == 'coordinates':
#         #             value = json.loads(params.get(param))
#         #             # Upper Right
#         #             ur = value[0]
#         #             # Lower Left
#         #             ll = value[1]
#         #             coordinates_filter.append(
#         #                 and_(between(
#         #                     literal_column(str('ra')),
#         #                     literal_column(str(ll[0])),
#         #                     literal_column(str(ur[0]))
#         #                 ), between(
#         #                     literal_column(str('dec')),
#         #                     literal_column(str(ll[1])),
#         #                     literal_column(str(ur[1]))
#         #                 ))
#         #             )
#         # rating_filters = and_(*DBBase.do_filter(self.table, filters) +
#         #                        DBBase.do_filter(catalog_rating_id, rating_filter) +
#         #                        coordinates_filter)
#         # stm = stm.where(and_(rating_filters, reject_filters))
#         #
#         # print(str(stm))
#         #
#         # # Parametros de Paginacao
#         # limit = params.get('limit', None)
#         # start = params.get('offset', None)
#         #
#         # if limit:
#         #     stm = stm.limit(literal_column(str(limit)))
#         #
#         # if start:
#         #     stm = stm.offset(literal_column(str(start)))
#         #
#         # # Parametros de Ordenacao
#         # ordering = params.get('ordering', None)
#         #
#         # if ordering is not None:
#         #     asc = True
#         #     property = ordering.lower()
#         #
#         #     if ordering[0] == '-':
#         #         asc = False
#         #         property = ordering[1:].lower()
#         #
#         #     if property == '_meta_rating':
#         #         property = catalog_rating_id.c.rating
#         #     elif property == '_meta_reject':
#         #         property = catalog_reject_id.c.reject
#         #     else:
#         #         property = 'a.' + property
#         #
#         #     if asc:
#         #         stm = stm.order_by(property)
#         #     else:
#         #         stm = stm.order_by(desc(property))
#
#         return stm
#
#     def query_result(self, request, properties):
#         stm = self._create_stm(request, properties)
#
#         result = self.db.fetchall_dict(stm)
#
#         count = self.db.stm_count(stm)
#
#         return result, count

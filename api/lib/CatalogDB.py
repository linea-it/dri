import warnings

from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy import Column
from sqlalchemy import exc as sa_exc
from sqlalchemy.sql import select, and_
from sqlalchemy.sql.expression import literal_column


class CatalogDB(DBBase):

    def __init__(self, db='catalog'):
        if db is None or db == "":
            db = 'catalog'

        super(CatalogDB, self).__init__(db)


class CatalogTable(CatalogDB):
    def __init__(self, table, schema=None, database=None):
        super(CatalogTable, self).__init__(db=database)

        if schema is None or schema is "":
            self.schema = None

        # columns = lista de instancias SqlAlchemy::Column() com todas as colunas da tabela
        self.columns = list()

        # column_name = Lista de string com os nomes de todas as colunas da tabela utilziada para checar se uma
        # determinada coluna existe na tabela.
        self.column_names = list()

        # query_columns = Lista das colunas que serao utilizada no Select, por default preenchida com self.columns
        # mas pode ser substituida por lista menor de colunas. as colunas devem ser instancias de SqlAlchemy::Column()
        self.query_columns = list()

        # Verificar se a Tabela Existe
        if not self.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" % (self.schema, table))

        # Criar os Metadata da Tabela para o SqlAlchemy

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            self.table = self.get_table_obj(table, schema=self.schema)

            # Nome das colunas originais na tabela
            for column in self.table.columns:
                column_name = column.key.strip().lower()

                self.columns.append(Column(column_name))
                self.column_names.append(column_name)
                self.query_columns.append(Column(column_name))

    def create_stm(self):
        """
        Cria a SqlAlchemy Statement, este metdo pode ser sobrescrito para criar querys diferentes.
        mais sempre deve retornar um statement.
        :return: statement
        """
        stm = select(self.query_columns).select_from(self.table)

        return stm

    def query_result(self):
        """
        Executa o statement criado pelo metodo create_stm
        :return: tuple(results, count)
            results: e a queryset os resultados retornados pela query
            count: e o total de registro encontrado pela query, IMPORTANTE esse count desconsidera os limit, ou seja
            mesmo que seja uma query paginda esse count e sempre o total de registros que satisfazem a query.
            ex: uma query com um filtro que retorne 100 resultados mais o parametro limit esta em 25 resultados, o
            count vai retornar 100. e o results vai ser uma queryset com 25 registros.
        """
        stm = self.create_stm()

        result = self.db.fetchall_dict(stm)

        count = self.db.stm_count(stm)

        return result, count


class CatalogObjectsDBHelper(CatalogTable):
    def __init__(self, table, schema=None, database=None, columns=list(), filters=None, limit=None, start=None):
        """

        :param table:
        :param schema:
        :param database:
        :param columns:
        :param filters: Esse Filtros devem estar no formato SqlAlchemy. pode ser usado o FconditionSerializer para converter.
            list([
                dict({
                    column: <nome da coluna>,
                    op: <operador>
                    value: <valor>
                })
            ])
        :param limit:
        :param start:
        """
        super(CatalogObjectsDBHelper, self).__init__(database=database, table=table, schema=schema)

        self.filters = list()
        self.limit = limit
        self.start = start

        # Se tiver recebido o parametro coluns para a query, adiciona as colunas ao atributo query_columns
        if len(columns) > 0:
            self.query_columns = list()
            for col in columns:
                if col in self.columns_names:
                    self.query_columns.append(Column(col))

        if filters is not None and len(filters) > 0:
            for condition in filters:
                # Checar se as propriedades a serem filtradas estao na lista de colunas da tabela.
                if condition.get("column").lower().strip() in self.column_names:
                    self.filters.append(condition)

    def create_stm(self):
        # Aqui pode entrar o parametro para escolher as colunas
        stm = select(self.query_columns).select_from(self.table)

        # Filtros
        filters = list()
        coordinates_filter = list()

        if self.filters is not None and len(self.filters) > 0:
            filters = self.filters

        # TODO: Filtro utilizando os parametros da url.
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

        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        return stm
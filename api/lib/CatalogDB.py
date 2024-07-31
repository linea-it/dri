import json
import logging
import math
import warnings

import numpy as np
import pandas as pd
import sqlalchemy
from django.core.paginator import Paginator
from django.db.models import query
from sqlalchemy import Column, cast, desc
from sqlalchemy import exc as sa_exc
from sqlalchemy import func
from sqlalchemy.sql import and_, or_, select, text
from sqlalchemy.sql.expression import between, literal_column

from lib.sqlalchemy_wrapper import DBBase


class CatalogDB(DBBase):
    def __init__(self, db='catalog'):
        if db == None or db == "":
            db = 'catalog'

        super(CatalogDB, self).__init__(db)


class CatalogTable(CatalogDB):
    def __init__(self, table, schema=None, database=None, associations=None):
        super(CatalogTable, self).__init__(db=database)

        # TODO Rever esta parte do Schema.
        self.schema = schema
        if schema == None or schema == "":
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

        self.associations = associations

        self.filters = list()

    def create_stm(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None):
        """
        Cria a SqlAlchemy Statement, este metdo pode ser sobrescrito para criar querys diferentes.
        mais sempre deve retornar um statement.
        :return: statement
        """
        self.set_filters(filters)
        self.set_query_columns(columns)
        self.set_url_filters(url_filters)
        self.limit = limit
        self.start = start
        self.ordering = ordering

        stm = select(self.query_columns).select_from(self.table)

        # Para esta query mais generica nao permitir filtros por condicoes especias "_meta_*"
        filters = list()
        for condition in self.filters:
            if condition.get("column").find("_meta_") == -1:
                filters.append(condition)

        stm = stm.where(and_(*self.do_filter(self.table, filters)))

        # Ordenacao
        if self.ordering != None:
            asc = True
            property = self.ordering.lower()

            if self.ordering[0] == '-':
                asc = False
                property = self.ordering[1:].lower()

            if asc:
                stm = stm.order_by(property)
            else:
                stm = stm.order_by(desc(property))

        # Paginacao
        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        return stm

    def query(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None):
        """
        Executa o statement criado pelo metodo create_stm
        :param columns:
        :param filters: Esse Filtros devem estar no formato SqlAlchemy. pode ser usado o FconditionSerializer para converter.
            list([
                dict({
                    column: <nome da coluna>,
                    op: <operador>
                    value: <valor>
                })
            ])
        :param ordering:
        :param limit:
        :param start:
        :return: tuple(results, count)
            results: e a queryset os resultados retornados pela query
            count: e o total de registro encontrado pela query, IMPORTANTE esse count desconsidera os limit, ou seja
            mesmo que seja uma query paginda esse count e sempre o total de registros que satisfazem a query.
            ex: uma query com um filtro que retorne 100 resultados mais o parametro limit esta em 25 resultados, o
            count vai retornar 100. e o results vai ser uma queryset com 25 registros.
        """
        # Cria o Statement para a query
        stm = self.create_stm(
            columns=columns,
            filters=filters,
            ordering=ordering,
            limit=limit,
            start=start,
            url_filters=url_filters
        )

        # executa o statement
        result = self.fetchall_dict(stm)

        # executa um metodo da DBbase para trazer o count sem levar em conta o limit e o start
        count = self.stm_count(stm)

        return result, count

    def set_query_columns(self, columns):
        # Se tiver recebido o parametro coluns para a query, adiciona as colunas ao atributo query_columns
        if len(columns) > 0:
            self.query_columns = list()
            for col in columns:
                if col in self.column_names:
                    self.query_columns.append(Column(col))

    def set_filters(self, filters):
        # Seta os filtros a serem aplicados no create_stm
        if filters != None and len(filters) > 0:

            for condition in filters:
                column = condition.get("column").lower().strip()

                # Checar se as propriedades a serem filtradas estao na lista de colunas da tabela.
                if column in self.column_names:
                    self.filters.append(condition)

                elif column.find("_meta_") != -1:
                    self.filters.append(condition)

    def set_url_filters(self, url_filters):
        # Filtros passados por url
        for condition in self.parse_url_filters(url_filters):
            self.filters.append(condition)

    def parse_url_filters(self, url_filters):

        conditions = list()

        if url_filters != None and len(url_filters) > 0:

            square_condition = dict({
                "lon": None,
                "lat": None,
                "radius": None,
                "column": "coordinates",
                "op": "coordinates",
                "upperright": [],
                "lowerleft": [],
                "property_ra": self.associations.get("pos.eq.ra;meta.main"),
                "property_dec": self.associations.get("pos.eq.dec;meta.main")
            })

            for param in url_filters:
                # para cara parametro vindo da url checar se e uma propriedade valida da tabela
                # e Criar um filtro para ela

                column = param.lower().strip()
                op = "eq"

                if param.find("__") != -1:
                    column, op = param.split('__')

                    # Tratar os operadores
                    if op == 'gte':
                        op = 'ge'
                    if op == 'lte':
                        op = 'le'

                # Se as propriedade esta na lista de colunas ou se e um filtro especial iniciado por _meta_
                if column in self.column_names or param.find("_meta_") != -1:
                    conditions.append(dict({
                        "column": column,
                        "op": op,
                        "value": url_filters.get(param)}))

                elif column == "coordinates":
                    try:
                        value = json.loads(url_filters.get(param))

                        conditions.append(dict({
                            "column": column,
                            "op": "coordinates",
                            "upperright": value[0],
                            "lowerleft": value[1],
                            "property_ra": self.associations.get("pos.eq.ra;meta.main"),
                            "property_dec": self.associations.get("pos.eq.dec;meta.main")
                        }))

                    except:
                        # Falhou ao criar a condicao de filtro por coordenadas provavelmente pela falta
                        # do atributo association
                        pass

                # Query por quadrado usando formato lon, lat do centro e raio.
                elif column == "lon" or column == "lat" or column == "radius":
                    # Prepara um objeto com as variaveis necessarias para a criar um quadrado.
                    square_condition[column] = url_filters.get(param)

            # Verificar se foi criado um filtro por tipo quadrado.
            if square_condition['lon'] != None or square_condition['lat'] != None or square_condition[
                    'radius'] != None:
                # criar as variaveis lowerleft e upperright

                lon = float(square_condition['lon'])
                lat = float(square_condition['lat'])
                radius = float(square_condition['radius'])

                lowerleft = [lon - radius,
                             lat - radius * math.cos(lat * math.pi / 180.)]

                upperright = [lon + radius,
                              lat + radius * math.cos(lat * math.pi / 180.)]

                square_condition.update({
                    "lowerleft": lowerleft,
                    "upperright": upperright
                })

                conditions.append(square_condition)

        return conditions

    def count(self):
        with self.engine.connect() as con:

            stm = select([func.count()]).select_from(self.table)
            self.log.debug("SQL: [%s]" % self.statement_to_str(stm))

            result = con.execute(stm)
            return result.fetchone()[0]


class CatalogObjectsDBHelper(CatalogTable):
    def create_stm(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None,
                   associations=None):

        self.set_filters(filters)
        self.set_query_columns(columns)
        self.set_url_filters(url_filters)
        self.limit = limit
        self.start = start
        self.ordering = ordering

        stm = select(self.query_columns).select_from(self.table)

        filters = list()
        coordinates_filter = None

        for condition in self.filters:
            if condition.get("op") == "coordinates":

                coordinates_filter = self.database.get_condition_square(
                    condition.get("lowerleft"),
                    condition.get("upperright"),
                    condition.get("property_ra"),
                    condition.get("property_dec"))

            else:
                filters.append(condition)

        base_filters = and_(*self.do_filter(self.table, filters))

        if coordinates_filter != None:
            stm = stm.where(and_(base_filters, coordinates_filter))
        else:
            stm = stm.where(base_filters)

        # Ordenacao
        if self.ordering != None:
            asc = True
            property = self.ordering.lower()

            if self.ordering[0] == '-':
                asc = False
                property = self.ordering[1:].lower()

            if asc:
                stm = stm.order_by(property)
            else:
                stm = stm.order_by(desc(property))

        # Paginacao
        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        self.log.debug("SQL: [%s]" % self.statement_to_str(stm))

        return stm


class TargetObjectsDBHelper(CatalogTable):
    def __init__(self, table, schema=None, database=None, associations=None, product=None,
                 user=None):
        super(TargetObjectsDBHelper, self).__init__(database=database, table=table, schema=schema,
                                                    associations=associations)

        self.log = logging.getLogger('catalog_db')

        # Catalogos de Target tem ligacao com o as tabelas Rating e Reject

        # Cria as instancias das tabelas de rating e reject
        # Trata os casos em que a tabela do usuario está em um banco diferente do banco de catalogos da aplicação.
        # so vai funcionar se os bancos forem os mesmos mas com tags diferentes na settings.
        # Exemplo Dessci e catalog, no Oracle ambas são o mesmo banco de dados.
        # self.schema_rating_reject = self.get_connection_schema()

        # if database != 'catalog':
        #     db_catalog = CatalogDB()

        #     self.schema_rating_reject = db_catalog.get_connection_schema()

        #     self.catalog_rating = db_catalog.get_table_obj('catalog_rating', schema=self.schema_rating_reject)
        #     self.catalog_reject = db_catalog.get_table_obj('catalog_reject', schema=self.schema_rating_reject)

        # else:
        #     self.catalog_rating = self.get_table_obj('catalog_rating', schema=self.schema_rating_reject)
        #     self.catalog_reject = self.get_table_obj('catalog_reject', schema=self.schema_rating_reject)

        # Para o as querys de Target e necessario ter a instancia do product para fazer os join com Rating e Reject
        if product is None:
            raise Exception(
                'for the target queries it is necessary the product parameter, which is used in'
                'the join with rating and reject.')

        self.product = product

        # Para as querys de Target e necessario a instancia de usuario para que as querys de Rating e Reject
        # tragam apenas as classificacoes do usuario
        if user is None:
            raise Exception('for the target queries the user parameter is required, '
                            'which is used in the join with rating and reject.')

        self.user = user

    def query(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None):
        """
        Executa o statement criado pelo metodo create_stm
        :param columns:
        :param filters: Esse Filtros devem estar no formato SqlAlchemy. pode ser usado o FconditionSerializer para converter.
            list([
                dict({
                    column: <nome da coluna>,
                    op: <operador>
                    value: <valor>
                })
            ])
        :param ordering:
        :param limit:
        :param start:
        :return: tuple(results, count)
            results: e a queryset os resultados retornados pela query
            count: e o total de registro encontrado pela query, IMPORTANTE esse count desconsidera os limit, ou seja
            mesmo que seja uma query paginda esse count e sempre o total de registros que satisfazem a query.
            ex: uma query com um filtro que retorne 100 resultados mais o parametro limit esta em 25 resultados, o
            count vai retornar 100. e o results vai ser uma queryset com 25 registros.
        """

        # Descobrir as colunas a serem usadas
        q_columns = self.parse_columns(columns)

        # recupera a propriedade associada como id
        property_id = self.associations.get("meta.id;meta.main").lower()
        self.log.debug("Property ID: %s" % property_id)

        # Tratar os Filtros
        self.set_filters(filters)
        self.set_url_filters(url_filters)
        self.log.debug("Filters: " % self.filters)

        # Testar se existe filtro especial
        special_filter = self.has_special_filter(self.filters)
        self.log.debug("Special Filter: %s" % special_filter)

        # Testar se existe ordenação especial
        special_ordering = self.has_special_ordering(ordering)
        self.log.debug("Special Ordering: %s" % special_ordering)

        if not special_filter and not special_ordering:

            return self.normal_query(property_id, q_columns, self.filters, ordering, limit, start)

        else:
            return self.virtual_query(property_id, q_columns, self.filters, ordering, limit, start)

    def normal_query(self, property_id, columns, filters, ordering, limit, start):
        self.log.debug("Executing a Normal Query")

        # faz a query na tabela de objetos normalmente
        stm_base = select(columns).select_from(self.table)

        # Filtros
        base_filters = list()
        coordinate_clauses = and_()

        if filters != None and len(filters) > 0:
            for condition in filters:
                if condition.get("column") == 'coordinates':

                    coordinate_clauses = self.database.get_condition_square(
                        condition.get("lowerleft"),
                        condition.get("upperright"),
                        condition.get("property_ra"),
                        condition.get("property_dec"))
                else:
                    base_filters.append(condition)

        clauses = and_(*self.do_filter(self.table, base_filters))

        stm_base = stm_base.where(and_(clauses, coordinate_clauses))

        # Ordenação
        if ordering != None:
            asc = True
            property = ordering.lower()

            if ordering[0] == '-':
                asc = False
                property = ordering[1:].lower()

            if asc:
                stm_base = stm_base.order_by(property)
            else:
                stm_base = stm_base.order_by(desc(property))

        # Paginacao
        if limit:
            stm_base = stm_base.limit(literal_column(str(limit)))

            if start:
                stm_base = stm_base.offset(literal_column(str(start)))

        self.log.info("Base Query: [ %s ]" % self.statement_to_str(stm_base))

        # Faz a query count com o total de linhas independente do limit.
        count = self.stm_count(stm_base)
        self.log.debug("Total Count: [%s]" % count)

        # Se o resultado da query for 0, retornar um array vazio e o count 0:
        if count == 0:
            self.log.info("No result was found!")
            return [], 0

        # Criar o Dataframe da tabela Object
        df_objects = pd.read_sql(
            stm_base,
            con=self.engine,
        )

        # Converte a coluna que representa o id do objeto para string.
        # O mesmo é feito nos outros dataframes,
        # é necessario que os tipos sejam iguais para o merge funcionar.
        df_objects[property_id] = df_objects[property_id].astype('string')

        self.log.debug(df_objects.head())
        self.log.debug("Count Df Objects: [%s]" % df_objects.shape[0])

        # Cria o Dataframe da tabela Rating
        df_rating = self.get_ratings(self.product.pk, self.user.pk)

        # Cria o Dataframe da tabela Reject
        df_reject = self.get_rejects(self.product.pk, self.user.pk)

        # Cria o Dataframe result fazendo o merge entre os Dataframes
        df_result = self.merge_dataframes(property_id, df_objects, df_rating, df_reject)

        result = df_result.to_dict('records')

        return result, count

    def virtual_query(self, property_id, columns, filters, ordering, limit, start):
        self.log.debug("Executing a Virtual Query")

        # faz a query na tabela de objetos selecionando apenas as colunas que serao utilizadas
        stm_base = select(columns).select_from(self.table)

        # Filtros
        # Aplica todos os filtros que não sejam rating/reject
        # Como os filtros são todos and, não faz diferença
        # aplicar os filtros normais agora ou no dataframe.
        # sendo que aplicar na query ira diminuir a quantidade de registro e agilizar o dataframe.
        base_filters = list()
        coordinate_clauses = and_()
        rating_conditions = list()
        reject_conditions = None

        if filters != None and len(filters) > 0:
            for condition in filters:

                # Separar o Filtros por rating/reject.
                # Serao aplicados no dataframe.
                if condition.get("column") == '_meta_rating':
                    condition.update({"column": "_meta_rating"})
                    condition.update({"value": int(condition.get("value"))})

                    rating_conditions.append(condition)

                elif condition.get("column") == '_meta_reject':
                    condition.update({"column": "_meta_reject"})
                    if condition.get("value") in ['True', 'true', '1', 't', 'y', 'yes', True]:
                        condition.update({"value": True})

                    reject_conditions = condition

                # Filtro de coordenada sera aplicado na query
                elif condition.get("column") == 'coordinates':
                    coordinate_clauses = self.database.get_condition_square(
                        condition.get("lowerleft"),
                        condition.get("upperright"),
                        condition.get("property_ra"),
                        condition.get("property_dec"))
                else:
                    base_filters.append(condition)

        clauses = and_(*self.do_filter(self.table, base_filters))

        stm_base = stm_base.where(and_(clauses, coordinate_clauses))

        self.log.info("Base Query: [ %s ]" % self.statement_to_str(stm_base))

        # Criar o Dataframe da tabela Object
        df_objects = pd.read_sql(
            stm_base,
            con=self.engine,
        )

        # Se o resultado da query for 0, retornar um array vazio e o count 0:
        if df_objects.empty:
            self.log.info("No result was found!")
            return [], 0

        # Converte a coluna que representa o id do objeto para string.
        # O mesmo é feito nos outros dataframes,
        # é necessario que os tipos sejam iguais para o merge funcionar.
        df_objects[property_id] = df_objects[property_id].astype('string')

        self.log.debug(df_objects.head())
        self.log.debug("Count Df Objects: [%s]" % df_objects.shape[0])

        # Cria o Dataframe da tabela Rating
        df_rating = self.get_ratings(self.product.pk, self.user.pk)

        # Cria o Dataframe da tabela Reject
        df_reject = self.get_rejects(self.product.pk, self.user.pk)

        # Cria o Dataframe result fazendo o merge entre os Dataframes
        df_result = self.merge_dataframes(property_id, df_objects, df_rating, df_reject)

        # Realizar filtro(s) na tabela Rating:
        self.log.debug("Check Rating conditions: [%s]" % rating_conditions)
        if len(rating_conditions) > 0:
            for condition in rating_conditions:
                if condition['op'] == 'eq':
                    df_result = df_result[df_result[condition['column']] == condition['value']]

                elif condition['op'] == 'ne':
                    df_result = df_result[df_result[condition['column']] != condition['value']]

                elif condition['op'] == 'gt':
                    df_result = df_result[df_result[condition['column']] > condition['value']]

                elif condition['op'] == 'ge':
                    df_result = df_result[df_result[condition['column']] >= condition['value']]

                elif condition['op'] == 'lt':
                    df_result = df_result[df_result[condition['column']] < condition['value']]

                elif condition['op'] == 'le':
                    df_result = df_result[df_result[condition['column']] <= condition['value']]

                else:
                    pass

        # Realizar filtro na tabela Reject:
        self.log.debug("Check Reject conditions: [%s]" % reject_conditions)
        if reject_conditions:
            if reject_conditions['op'] == 'eq':
                df_result = df_result[df_result[reject_conditions['column']] == reject_conditions['value']]

            elif reject_conditions['op'] == 'ne':
                df_result = df_result[df_result[reject_conditions['column']] != reject_conditions['value']]
            else:
                pass

        # Total de registros no dataframe depois dos filtros.
        count = df_result.shape[0]
        self.log.debug("Total Count: [%s]" % count)

        # Ordenação
        if ordering != None:
            asc = True
            property = ordering.lower()

            if ordering[0] == '-':
                asc = False
                property = ordering[1:].lower()

            if property == '_meta_rating':
                # transforma os valores de rating = 0 para rating = NaN
                # Isso permite que a ordenação coloque os valores de NaN por ultimo
                # melhorando a visualização quando o dataframe é ordenado pelo rating.
                df_result['_meta_rating'] = df_result['_meta_rating'].replace(0, np.nan)
                # Ordena o Dataframe utilizando a opção na_position = last.
                # https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.sort_values.html
                df_result = df_result.sort_values(by=[property], ascending=asc, na_position='last')
                # Apos a ordenação retorna os valores NaN para 0.
                df_result['_meta_rating'] = df_result['_meta_rating'].fillna(0)
            else:
                df_result = df_result.sort_values(by=[property], ascending=asc)

        # Converte Dataframe para dict
        result = df_result.to_dict('records')

        # Paginacao
        if limit:
            paginator = Paginator(result, int(limit))

            if start is None or int(start) == 0:
                page = paginator.get_page(1)
            else:
                pageNumber = int((int(start) / int(limit)) + 1)
                self.log.debug("pageNumber: %s" % pageNumber)
                page = paginator.get_page(pageNumber)

            result = page.object_list

        return result, count

    def merge_dataframes(self, property_id, objects, rating, reject):

        # Faz o JOIN entre Objects + Rating + Reject
        df_result = objects.merge(
            rating.set_index('object_id'), how='left', left_on=property_id, right_on='object_id'
        ).merge(
            reject.set_index('object_id'), how='left', left_on=property_id, right_on='object_id'
        )

        # Substituir os valores NaN por Nulo ou 0
        df_result['_meta_rating_id'] = df_result['_meta_rating_id'].replace({np.nan: None})
        df_result['_meta_rating'] = df_result['_meta_rating'].fillna(0)
        df_result['_meta_reject_id'] = df_result['_meta_reject_id'].replace({np.nan: None})
        df_result['_meta_reject'] = df_result['_meta_reject'].fillna(False)

        self.log.debug("Join Object + Rating + Reject")
        self.log.debug("-----------------------------")
        self.log.debug(df_result.head())
        self.log.debug("Count Objects: [%s]" % df_result.shape[0])
        self.log.debug("First Row: %s " % df_result.loc[[0]].to_dict('records'))

        return df_result

    def parse_columns(self, columns):

        # Colunas que serao utilizadas na query
        query_columns = list()
        # Todas as colunas da tabela
        tbl_columns = list()

        # Lista com nome das colunas
        column_names = self.table.c.keys()

        for column in self.table.c:
            tbl_columns.append(column)

        # Se houver seleção de colunas
        if len(columns) != 0:
            # Adiciona apenas as colunas especificadas
            for column in columns:
                # valida que a coluna solicitada exite na tabela
                if column in column_names:
                    query_columns.append(Column(column))
        else:
            # Quando não tem seleção utiliza todas as colunas.
            query_columns = tbl_columns

        self.log.debug("Columns: %s" % query_columns)

        return query_columns

    def has_special_filter(self, filters):
        # Verifica se algum filtro especial será usado.
        # exemplo: _meta_rating, _meta_reject ou coordinates
        if filters != None and len(filters) > 0:
            for condition in filters:
                # Verificar na lista de filtros se tem algum filtro especial
                if condition.get("column").find("_meta_") != -1 or condition.get("column") == 'coordinates':
                    return True

        return False

    def has_special_ordering(self, ordering):

        if ordering != None:
            property = ordering.lower()
            if property.find("_meta_") != -1:
                return True

        return False

    def get_ratings(self, product_id, owner_id):
        # db_catalog = CatalogDB(db='catalog')

        # schema_rating_reject = db_catalog.get_connection_schema()

        # tbl_rating = db_catalog.get_table_obj('catalog_rating', schema=schema_rating_reject)

        # # Filtrar a tabela por prodruto e por owner
        # # Isso vai trazer todos os registros de ratings referentes a tabela object
        # # independente de paginação ou filtros
        # stm_rating = select([tbl_rating.c.id, tbl_rating.c.object_id, tbl_rating.c.rating, ]).where(and_(
        #     tbl_rating.c.catalog_id == product_id,
        #     tbl_rating.c.owner == owner_id
        # ))

        # self.log.info("Rating Query: [ %s ]" % self.statement_to_str(stm_rating))

        # # Criar o Dataframe da tabela Rating
        # df_rating = pd.read_sql(
        #     stm_rating,
        #     con=self.engine,
        # )
        # df_rating = df_rating.rename(columns={"id": "_meta_rating_id", "rating": "_meta_rating"})
        # df_rating['object_id'] = df_rating['object_id'].astype('string')

        # self.log.debug(df_rating.head())

        # self.log.debug("Count Df Ratings: [%s]" % df_rating.shape[0])

        self.log.info("Return empty Rating Dataframe.")
        df_rating = pd.DataFrame(columns=['_meta_rating_id', 'catalog_id', 'owner', 'object_id', '_meta_rating'])
        return df_rating

    def get_rejects(self, product_id, owner_id):

        # db_catalog = CatalogDB()
        # schema_rating_reject = db_catalog.get_connection_schema()
        # tbl_reject = db_catalog.get_table_obj('catalog_reject', schema=schema_rating_reject)

        # # Filtrar a tabela por prodruto e por owner
        # # Isso vai trazer todos os registros de reject referentes a tabela object
        # # independente de paginação ou filtros
        # stm_reject = select([tbl_reject.c.id, tbl_reject.c.object_id, tbl_reject.c.reject]).where(and_(
        #     tbl_reject.c.catalog_id == product_id,
        #     tbl_reject.c.owner == owner_id
        # ))

        # self.log.info("Reject Query: [ %s ]" % self.statement_to_str(stm_reject))

        # # Criar o Dataframe da tabela Reject
        # df_reject = pd.read_sql(
        #     stm_reject,
        #     con=self.engine,
        # )
        # df_reject = df_reject.rename(columns={"id": "_meta_reject_id", "reject": "_meta_reject"})
        # df_reject['object_id'] = df_reject['object_id'].astype('string')

        # self.log.debug(df_reject.head())

        # self.log.debug("Count Df Rejects: [%s]" % df_reject.shape[0])

        self.log.info("Return empty Reject Dataframe.")
        df_reject = pd.DataFrame(columns=['_meta_reject_id', 'catalog_id', 'owner', 'object_id', '_meta_reject'])

        return df_reject

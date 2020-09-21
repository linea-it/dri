import json
import math
import warnings

import sqlalchemy
from sqlalchemy import Column, cast, desc
from sqlalchemy import exc as sa_exc
from sqlalchemy.sql import and_, or_, select
from sqlalchemy.sql.expression import between, literal_column

from lib.sqlalchemy_wrapper import DBBase
import logging


class CatalogDB(DBBase):
    def __init__(self, db='catalog'):
        if db is None or db == "":
            db = 'catalog'

        super(CatalogDB, self).__init__(db)


class CatalogTable(CatalogDB):
    def __init__(self, table, schema=None, database=None, associations=None):
        super(CatalogTable, self).__init__(db=database)

        self.schema = schema
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
            if schema:
                raise Exception("Table or view  %s.%s does not exist" % (self.schema, table))
            else:
                raise Exception("Table or view  %s does not exist" % (table))

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
            if condition.get("column").find("_meta_") is -1:
                filters.append(condition)

        stm = stm.where(and_(*self.do_filter(self.table, filters)))

        # Ordenacao
        if self.ordering is not None:
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
        if filters is not None and len(filters) > 0:

            for condition in filters:
                column = condition.get("column").lower().strip()

                # Checar se as propriedades a serem filtradas estao na lista de colunas da tabela.
                if column in self.column_names:
                    self.filters.append(condition)

                elif column.find("_meta_") is not -1:
                    self.filters.append(condition)

    def set_url_filters(self, url_filters):
        # Filtros passados por url
        for condition in self.parse_url_filters(url_filters):
            self.filters.append(condition)

    def parse_url_filters(self, url_filters):

        conditions = list()

        if url_filters is not None and len(url_filters) > 0:

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

                if param.find("__") is not -1:
                    column, op = param.split('__')

                    # Tratar os operadores
                    if op == 'gte':
                        op = 'ge'
                    if op == 'lte':
                        op = 'le'

                # Se as propriedade esta na lista de colunas ou se e um filtro especial iniciado por _meta_
                if column in self.column_names or param.find("_meta_") is not -1:
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
            if square_condition['lon'] is not None or square_condition['lat'] is not None or square_condition[
                    'radius'] is not None:
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

    def get_condition_square(self, lowerleft, upperright, property_ra, property_dec):

        # Tratar RA > 360
        llra = float(lowerleft[0])
        lldec = float(lowerleft[1])

        urra = float(upperright[0])
        urdec = float(upperright[1])

        if llra > 360:
            llra = llra - 360

        if urra > 360:
            urra = urra - 360

        # Verificar se o RA 0 esta entre llra e urra
        if (llra < 0 and urra < 0) or (llra > 0 and urra > 0):
            # RA 0 nao esta na area da consulta pode se usar o between simples

            # BETWEEN llra and urra
            raCondition = between(
                Column(str(property_ra)),
                literal_column(str(llra)),
                literal_column(str(urra))
            )

        else:
            # Area de interesse passa pelo RA 0 usar 2 between separando ate 0 e depois de 0

            llralt0 = 360 - (llra * -1)

            # Solucao para catalogos com RA 0 - 360
            raLTZero = between(
                Column(str(property_ra)),
                literal_column(str(llralt0)),
                literal_column("360")
            )

            raGTZero = between(
                Column(str(property_ra)),
                literal_column("0"),
                literal_column(str(urra))
            )

            raCondition360 = or_(raLTZero, raGTZero).self_group()

            # Solucao para catalogos com RA -180 a 180
            raCondition180 = between(
                Column(str(property_ra)),
                literal_column(str(llra)),
                literal_column(str(urra))
            )

            raCondition = or_(raCondition360, raCondition180).self_group()

        decCondition = between(
            Column(str(property_dec)),
            literal_column(str(lldec)),
            literal_column(str(urdec))
        )

        return and_(raCondition, decCondition).self_group()


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
        coordinates_filter = ""

        for condition in self.filters:
            if condition.get("op") == "coordinates":

                coordinates_filter = self.get_condition_square(
                    condition.get("lowerleft"),
                    condition.get("upperright"),
                    condition.get("property_ra"),
                    condition.get("property_dec"))

            else:
                filters.append(condition)

        base_filters = and_(*self.do_filter(self.table, filters))

        stm = stm.where(and_(base_filters, coordinates_filter))

        # Ordenacao
        if self.ordering is not None:
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

        print(str(stm))

        return stm


class TargetObjectsDBHelper(CatalogTable):
    def __init__(self, table, schema=None, database=None, associations=None, schema_rating_reject=None, product=None,
                 user=None):
        super(TargetObjectsDBHelper, self).__init__(database=database, table=table, schema=schema,
                                                    associations=associations)

        self.log = logging.getLogger('django')
        # Catalogos de Target tem ligacao com o as tabelas Rating e Reject
        # Esse atributo deve vir do Settings
        # Cria as instancias das tabelas de rating e reject
        # TODO: Evitar o uso dessa variavel de ambiente, deve vir da classe DBBase.
        self.schema_rating_reject = schema_rating_reject

        # Trata os casos em que a tabela do usuario está em um banco diferente do banco de catalogos da aplicação.
        # so vai funcionar se os bancos forem os mesmos mas com tags diferentes na settings.
        # Exemplo Dessci e catalog, no Oracle ambas são o mesmo banco de dados.
        if database is not 'catalog':
            db_catalog = CatalogDB()

            self.catalog_rating = db_catalog.get_table_obj('catalog_rating', schema=self.schema_rating_reject)
            self.catalog_reject = db_catalog.get_table_obj('catalog_reject', schema=self.schema_rating_reject)
        else:
            self.catalog_rating = self.get_table_obj('catalog_rating', schema=self.schema_rating_reject)
            self.catalog_reject = self.get_table_obj('catalog_reject', schema=self.schema_rating_reject)

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

    def create_stm(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None,
                   prevent_ambiguously=False):

        self.set_filters(filters)
        self.set_query_columns(columns)
        self.set_url_filters(url_filters)
        self.limit = limit
        self.start = start
        self.ordering = ordering

        # recupera a propriedade associada como id
        property_id = self.associations.get("meta.id;meta.main").lower()

        # Adiciona um alias a tabela principal
        self.table = self.table.alias('a')

        # Adiciona alias as tabelas rating e reject
        catalog_rating = self.catalog_rating.alias('b')
        catalog_reject = self.catalog_reject.alias('c')

        # Cria os Joins
        stm_join = self.table

        # Join com Catalog_Rating
        stm_join = stm_join.join(catalog_rating,
                                 and_(
                                     # Product ID
                                     catalog_rating.c.catalog_id == self.product.pk,
                                     # User ID
                                     catalog_rating.c.owner == self.user.pk,
                                     # Object ID
                                     self.get_column_obj(self.table, property_id) == catalog_rating.c.object_id,
                                     # Fazer o Cast da coluna objeto id do catalogo para String, por que na catalog rating object_id é string
                                     # 15/09/2020 - este cast para string gerou um bug no Oracle
                                     # cast(self.get_column_obj(self.table, property_id), sqlalchemy.String)  == catalog_rating.c.object_id,
                                 ),
                                 isouter=True)

        stm_join = stm_join.join(catalog_reject,
                                 and_(
                                     # Product ID
                                     catalog_reject.c.catalog_id == self.product.pk,
                                     # User ID
                                     catalog_reject.c.owner == self.user.pk,
                                     # Object Id OR Reject is NULL
                                     or_(self.get_column_obj(self.table, property_id) == catalog_reject.c.object_id,
                                         catalog_reject.c.id.is_(None))
                                     # Fazer o Cast da coluna objeto id do catalogo para String, por que na catalog reject object_id é string
                                     # 15/09/2020 - este cast para string gerou um bug no Oracle
                                     #  or_(cast(self.get_column_obj(self.table, property_id), sqlalchemy.String) == catalog_reject.c.object_id,
                                     #      catalog_reject.c.id.is_(None))
                                 ),
                                 isouter=True)

        query_columns = list()

        if len(columns) == 0:
            # Criar o Statement usando as todas as colunas mais as colunas de rating and reject.
            for column in self.table.c:
                query_columns.append(column)

            # Se a Flag Prevent Ambiguos for True nao adicionar essas colunas pois vai gerar erro no banco de dados.
            if not prevent_ambiguously:
                query_columns.append(catalog_rating.c.id.label('meta_rating_id'))
                query_columns.append(catalog_rating.c.rating.label('meta_rating'))
                query_columns.append(catalog_reject.c.id.label('meta_reject_id'))
                query_columns.append(catalog_reject.c.reject.label('meta_reject'))

        else:
            # Usar apenas as colunas selecionadas
            for column in self.query_columns:
                if column in list(catalog_rating.c):
                    query_columns.append(catalog_rating.c[column])

                elif column in list(catalog_reject.c):
                    query_columns.append(catalog_reject.c[column])

                else:
                    query_columns.append(column)
                    # query_columns.append(self.table.c[column])

        stm = select(query_columns).select_from(stm_join)

        # Filtros
        filters = list()
        rating_filters = ""
        reject_filters = ""
        coordinate_filters = ""

        # Targets podem ter filtros especias checar a existencia deles
        if self.filters is not None and len(self.filters) > 0:

            for condition in self.filters:

                if condition.get("column").find("_meta_") is not -1:
                    # Filtro Especial onde a propriedade nao faz parte da tabela original

                    if condition.get("column") == '_meta_rating':
                        condition.update({"column": "rating"})
                        condition.update({"value": int(condition.get("value"))})

                        rating_filters = and_(*self.do_filter(catalog_rating, list([condition])))

                    elif condition.get("column") == '_meta_reject':
                        reject_filters = or_(catalog_reject.c.reject.is_(None), catalog_reject.c.reject == 0)

                        if condition.get("value") in ['True', 'true', '1', 't', 'y', 'yes']:
                            reject_filters = catalog_reject.c.reject == 1

                elif condition.get("column") == 'coordinates':

                    coordinate_filters = self.get_condition_square(
                        condition.get("lowerleft"),
                        condition.get("upperright"),
                        condition.get("property_ra"),
                        condition.get("property_dec"))

                else:
                    filters.append(condition)

        base_filters = and_(*self.do_filter(self.table, filters))

        stm = stm.where(and_(base_filters, coordinate_filters, rating_filters, reject_filters))

        # Ordenacao
        if self.ordering is not None:
            asc = True
            property = self.ordering.lower()

            if self.ordering[0] == '-':
                asc = False
                property = self.ordering[1:].lower()

            if property == '_meta_rating':
                property = catalog_rating.c.rating
            elif property == '_meta_reject':
                property = catalog_reject.c.reject
            else:
                property = 'a.' + property

            if asc:
                stm = stm.order_by(property)
            else:
                stm = stm.order_by(desc(property))

        # Paginacao
        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        self.log.info("Target Query: [ %s ]" % str(stm))

        return stm

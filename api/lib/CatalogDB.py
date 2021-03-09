import json
import logging
import math
import warnings

import sqlalchemy
from sqlalchemy import Column, cast, desc
from sqlalchemy import exc as sa_exc
from sqlalchemy import func
from sqlalchemy.sql import and_, or_, select, text
from sqlalchemy.sql.expression import between, literal_column
from lib.sqlalchemy_wrapper import DBBase

import pandas as pd
import numpy as np


class CatalogDB(DBBase):
    def __init__(self, db='catalog'):
        if db is None or db == "":
            db = 'catalog'

        super(CatalogDB, self).__init__(db)


class CatalogTable(CatalogDB):
    def __init__(self, table, schema=None, database=None, associations=None):
        super(CatalogTable, self).__init__(db=database)

        # TODO Rever esta parte do Schema.
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

        # Pagination
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

                    except BaseException:
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

        if coordinates_filter is not None:
            stm = stm.where(and_(base_filters, coordinates_filter))
        else:
            stm = stm.where(base_filters)

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

        # Pagination
        if self.limit:
            stm = stm.limit(literal_column(str(self.limit)))

            if self.start:
                stm = stm.offset(literal_column(str(self.start)))

        self.log.debug("SQL: [%s]" % self.statement_to_str(stm))

        return stm


class TargetObjectsDBHelper(CatalogTable):
    def __init__(self, table, schema=None, database=None, associations=None, schema_rating_reject=None, product=None,
                 user=None):
        super(TargetObjectsDBHelper, self).__init__(database=database, table=table, schema=schema,
                                                    associations=associations)

        self.log = logging.getLogger('django')
        self.logger = logging.getLogger('import_target_csv')
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
        :return: tuple(count, results)
            count: e o total de registro encontrado pela query, IMPORTANTE esse count desconsidera os limit, ou seja
            mesmo que seja uma query paginda esse count e sempre o total de registros que satisfazem a query.
            results: e a queryset os resultados retornados pela query
            ex: uma query com um filtro que retorne 100 resultados mais o parametro limit esta em 25 resultados, o
            count vai retornar 100. e o results vai ser uma queryset com 25 registros.
        """
        # Cria o Statement para a query
        rows, count = self.create_stm(
            columns=columns,
            filters=filters,
            ordering=ordering,
            limit=limit,
            start=start,
            url_filters=url_filters
        )

        return rows, count

    def create_stm(self, columns=list(), filters=None, ordering=None, limit=None, start=None, url_filters=None, prevent_ambiguously=False):

        self.set_filters(filters)
        self.set_query_columns(columns)
        self.set_url_filters(url_filters)
        self.limit = limit
        self.start = start
        self.ordering = ordering

        # Adding alias to the default table
        self.table = self.table.alias('a')

        # Adding alias to the rating and reject tables
        catalog_rating = self.catalog_rating.alias('b')
        catalog_reject = self.catalog_reject.alias('c')

        # Objects query
        objects = select(self.table.c).select_from(self.table)

        # Rating query and, under, association and filter
        ratings = select(catalog_rating.c).select_from(catalog_rating)
        ratings_association = and_(catalog_rating.c.owner == self.user.pk, catalog_rating.c.catalog_id == self.product.pk)

        # Reject query and, under, association and filter
        rejects = select(catalog_reject.c).select_from(catalog_reject)
        rejects_association = and_(catalog_reject.c.owner == self.user.pk, catalog_reject.c.catalog_id == self.product.pk)

        # Ordering and filtering flags for Rating and Reject tables:
        is_ordering_rating = False
        is_ordering_reject = False
        is_filtering_rating = False
        is_filtering_reject = False

        # Execute a DBbase method to count the table
        # without pagination or limit:
        # count = self.stm_count(objects)
        count = 0

        self.logger.debug('1')

        # Filters
        filters = list()
        rating_filters = and_()
        reject_filters = and_()
        coordinate_filters = and_()

        self.logger.debug("1")

        # Check if Targets have special filters:
        if self.filters is not None and len(self.filters) > 0:
            # For each filter:
            for condition in self.filters:

                # Special filter where the property is not in the default table:
                if condition.get("column").find("_meta_") is not -1:

                    # If the filter is on the rating table:
                    if condition.get("column") == '_meta_rating':
                        is_filtering_rating = True
                        condition.update({"column": "rating"})
                        condition.update({"value": int(condition.get("value"))})

                        rating_filters = and_(*self.do_filter(catalog_rating, list([condition])))

                    # If the filter is on the reject table:
                    elif condition.get("column") == '_meta_reject':
                        is_filtering_reject = True
                        reject_filters = or_(catalog_reject.c.reject.is_(None), catalog_reject.c.reject == 0)

                        if condition.get("value") in ['True', 'true', '1', 't', 'y', 'yes']:
                            reject_filters = and_(catalog_reject.c.reject == 'true')

                # If the filter is a coordinate:
                elif condition.get("column") == 'coordinates':

                    coordinate_filters = self.database.get_condition_square(
                        condition.get("lowerleft"),
                        condition.get("upperright"),
                        condition.get("property_ra"),
                        condition.get("property_dec"))

                else:
                    filters.append(condition)

        base_filters = and_(*self.do_filter(self.table, filters))

        object_filters = and_(base_filters, coordinate_filters)

        # Ordering property and ascending flag:
        property = ''
        asc = True

        self.logger.debug("2")

        # Ordering
        if self.ordering is not None:
            asc = True
            ordering = self.ordering.lower()

            # Get ordering without the "-" if it is
            # in descending order:
            property = ordering[1:] if ordering[0] == '-' else ordering

            if ordering[0] == '-':
                asc = False

            if property == '_meta_rating':
                is_ordering_rating = True

            if property == '_meta_reject':
                is_ordering_reject = True

        self.logger.debug("3")

        # If is ordering rating
        # and it doesn't have a reject filter
        # or if it has a rating filter:
        if is_ordering_rating and not is_filtering_reject or is_filtering_rating:

            # Ordering
            if is_ordering_rating:
                property = 'rating'
                property = text('b.' + property)

                if asc:
                    ratings = ratings.order_by(property)
                else:
                    ratings = ratings.order_by(desc(property))

            # Pagination
            if self.limit:
                ratings = ratings.limit(literal_column(str(self.limit)))

                if self.start:
                    ratings = ratings.offset(literal_column(str(self.start)))

            # Add Rating where clause with the filters
            # and associations and run query:
            ratings = ratings.where(and_(ratings_association, rating_filters))

            self.logger.debug("4")

            self.logger.debug('-------------------- IF --------------------')
            self.logger.debug(ratings)

            ratings = self.fetchall_dict(ratings)

            # Get objects and rejects without the ordering and associations:
            objects_without_ordering = self.fetchall_dict(objects.where(and_(object_filters)))
            rejects_without_ordering = self.fetchall_dict(rejects.where(and_(rejects_association, reject_filters)))

            # Make lists of Reject and Rating with only the objects IDs:
            rejects_obj_ids = [int(r['object_id']) for r in rejects_without_ordering]
            ratings_obj_ids = [r['object_id'] for r in ratings]

            # Objects ands Rejects that have the object id inside the list of ratings object ids:
            objects = objects.where(and_(object_filters, self.table.c.meta_id.in_(tuple(ratings_obj_ids))))
            rejects = rejects.where(and_(rejects_association, reject_filters, catalog_reject.c.object_id.in_(tuple(ratings_obj_ids))))

            # Convert the ratings object ids string into integers:
            ratings_obj_ids = list(map(int, ratings_obj_ids))

            self.logger.debug(rejects)
            self.logger.debug(objects)

            # Run Rejects and Objects queries and get their result:
            rejects = self.fetchall_dict(rejects)
            objects = self.fetchall_dict(objects)

            # If there's not Rating filter:
            if not is_filtering_rating:

                # If there's Rating or Reject ordering:
                if is_ordering_rating or is_ordering_reject:

                    # If the Ratings length is not equal to the Objects
                    # without the ordering and associations:
                    if len(ratings) != len(objects_without_ordering):

                        # For each object without ordering and associations:
                        for obj in objects_without_ordering:

                            # If the object id is not in the ratings object ids list
                            # append into the ratings empty entries.
                            # This is in case there's no table entry for these objects;
                            # if there's no rating, there's row in the table.
                            if obj['meta_id'] not in ratings_obj_ids:

                                objects.append(obj)

                                ratings.append({
                                    "id": None,
                                    "catalog_id": self.product.pk,
                                    "owner": self.user.pk,
                                    "object_id": obj['meta_id'],
                                    "rating": 0
                                })

                    self.logger.debug("5")

                    # If the Ratings length is not equal to the Objects
                    # without the ordering and associations:
                    if len(rejects) != len(objects_without_ordering):

                        # For each object without ordering and associations:
                        for obj in objects_without_ordering:

                            # If the object id is not in the rejects object ids list
                            # append into the rejects empty entries.
                            # This is in case there's no table entry for these objects;
                            # if there's no reject, there's row in the table.
                            if obj['meta_id'] not in rejects_obj_ids:

                                if obj['meta_id'] in rejects_obj_ids:
                                    idx = rejects_obj_ids.index(obj['meta_id'])
                                    rejects.append(rejects_without_ordering[idx])
                                else:
                                    rejects.append({
                                        "id": None,
                                        "catalog_id": self.product.pk,
                                        "owner": self.user.pk,
                                        "object_id": obj['meta_id'],
                                        "reject": False
                                    })

                    self.logger.debug("6")

        # If is ordering reject
        # and it doesn't have a rating filter
        # or if it has a reject filter:
        elif is_ordering_reject and not is_filtering_rating or is_filtering_reject:

            self.logger.debug("7")

            # Ordering
            if is_ordering_reject:
                property = 'reject'
                if asc:
                    property = text('c.' + property)
                    rejects = rejects.order_by(property)
                else:
                    rejects = rejects.order_by(desc(property))

            # Pagination
            if self.limit:
                rejects = rejects.limit(literal_column(str(self.limit)))

                if self.start:
                    rejects = rejects.offset(literal_column(str(self.start)))

            # Add Reject where clause with the filters
            # and associations and run query:
            rejects = rejects.where(and_(rejects_association, reject_filters))

            self.logger.debug("8")

            self.logger.debug('-------------------- ELIF --------------------')
            self.logger.debug(rejects)

            rejects = self.fetchall_dict(rejects)

            # Get objects and ratings without the ordering and associations:
            objects_without_ordering = self.fetchall_dict(objects.where(and_(object_filters)))
            ratings_without_ordering = self.fetchall_dict(ratings.where(and_(ratings_association, rating_filters)))

            # Make lists of Reject and Rating with only the objects IDs:
            ratings_obj_ids = [int(r['object_id']) for r in ratings_without_ordering]
            rejects_obj_ids = [r['object_id'] for r in rejects]

            # Objects ands Ratings that have the object id inside the list of rejects object ids:
            objects = objects.where(and_(object_filters, self.table.c.meta_id.in_(tuple(rejects_obj_ids))))
            ratings = ratings.where(and_(ratings_association, rating_filters, catalog_rating.c.object_id.in_(tuple(rejects_obj_ids))))

            # Convert the rejects object ids string into integers:
            rejects_obj_ids = list(map(int, rejects_obj_ids))

            self.logger.debug(ratings)
            self.logger.debug(objects)

            # Run Ratings and Objects queries and get their result:
            ratings = self.fetchall_dict(ratings)
            objects = self.fetchall_dict(objects)

            self.logger.debug("9")

            # If there's not Reject filter:
            if not is_filtering_reject:

                # If there's Rating or Reject ordering:
                if is_ordering_rating or is_ordering_reject:

                    # If the Rejects length is not equal to the Objects
                    # without the ordering and associations:
                    if len(rejects) != len(objects_without_ordering):

                        # For each object without ordering and associations:
                        for obj in objects_without_ordering:

                            # If the object id is not in the rejects object ids list
                            # append into the rejects empty entries.
                            # This is in case there's no table entry for these objects;
                            # if there's no reject, there's row in the table.
                            if obj['meta_id'] not in rejects_obj_ids:

                                objects.append(obj)

                                rejects.append({
                                    "id": None,
                                    "catalog_id": self.product.pk,
                                    "owner": self.user.pk,
                                    "object_id": obj['meta_id'],
                                    "reject": False
                                })

                    # If the Ratings length is not equal to the Objects
                    # without the ordering and associations:
                    if len(ratings) != len(objects_without_ordering):

                        # For each object without ordering and associations:
                        for obj in objects_without_ordering:

                            # If the object id is not in the rejects object ids list
                            # append into the rejects empty entries.
                            # This is in case there's no table entry for these objects;
                            # if there's no reject, there's row in the table.
                            if obj['meta_id'] not in rejects_obj_ids:

                                if obj['meta_id'] in ratings_obj_ids:
                                    idx = ratings_obj_ids.index(obj['meta_id'])
                                    ratings.append(ratings_without_ordering[idx])
                                else:
                                    ratings.append({
                                        "id": None,
                                        "catalog_id": self.product.pk,
                                        "owner": self.user.pk,
                                        "object_id": obj['meta_id'],
                                        "rating": 0
                                    })

            self.logger.debug("10")
        # Else, if it doesn't have rating and reject filter or ordering:
        else:

            self.logger.debug("11")
            # Ordering
            if property != '':
                if asc:
                    property = text('a.' + property)
                    objects = objects.order_by(property)
                else:
                    objects = objects.order_by(desc(property))

            # Pagination
            if self.limit:
                rejects = rejects.limit(literal_column(str(self.limit)))

                if self.start:
                    rejects = rejects.offset(literal_column(str(self.start)))

            self.logger.debug("12")

            # Add Ratings, Rejects and Objects where clause with the filters
            # and associations and run queries:
            ratings = ratings.where(and_(ratings_association, rating_filters))
            rejects = rejects.where(and_(rejects_association, reject_filters))
            objects = objects.where(and_(object_filters))

            self.logger.debug("13")

            self.logger.debug('-------------------- ELSE --------------------')
            self.logger.debug(ratings)
            self.logger.debug(rejects)
            self.logger.debug(objects)

            ratings = self.fetchall_dict(ratings)
            rejects = self.fetchall_dict(rejects)
            objects = self.fetchall_dict(objects)

        # Objects list of dictionaries to dataframe
        # to merge with Rating and Reject:
        df_objects = pd.DataFrame().append(objects, ignore_index=False)

        # Initialize some columns
        # that will me merged with Rating and Reject:
        df_objects['meta_rating_id'] = None
        df_objects['meta_rating'] = None
        df_objects['meta_reject_id'] = None
        df_objects['meta_reject'] = False

        self.logger.debug("14")

        # Ratings to dataframe and replacing the "NaN" to "None":
        df_ratings = pd.DataFrame().append(ratings, ignore_index=False)
        df_ratings = df_ratings.where(pd.notnull(df_ratings), None)

        # Rejects to dataframe and replacing the "NaN" to "None":
        df_rejects = pd.DataFrame().append(rejects, ignore_index=False)
        df_rejects = df_rejects.where(pd.notnull(df_rejects), None)

        self.logger.debug("15")

        # For each rating, insert it into the objects dataframe:
        for index, row in df_ratings.iterrows():
            df_objects.loc[df_objects['meta_id'] == int(row['object_id']), 'meta_rating_id'] = row['id']
            df_objects.loc[df_objects['meta_id'] == int(row['object_id']), 'meta_rating'] = row['rating']

        # For each reject, insert it into the objects dataframe:
        for index, row in df_rejects.iterrows():
            df_objects.loc[df_objects['meta_id'] == int(row['object_id']), 'meta_reject_id'] = row['id']
            df_objects.loc[df_objects['meta_id'] == int(row['object_id']), 'meta_reject'] = row['reject']

        # If it is ordered by rating:
        if is_ordering_rating:
            df_objects = df_objects.sort_values(by=['meta_rating'], ascending=asc)

        # If it is ordered by reject:
        if is_ordering_reject:
            df_objects = df_objects.sort_values(by=['meta_reject'], ascending=asc)

        # If it is ordered by another column, besides rating and reject:
        if not is_ordering_rating and not is_ordering_reject and property != '':
            property = str(property).split('.')
            property = property[1] if len(property) == 2 else property[0]

            df_objects = df_objects.sort_values(by=[property], ascending=asc)

        self.logger.debug("16")

        # Turn the objects dataframe back to a list of dictionaries:
        rows = df_objects.to_dict('records')

        return rows, count

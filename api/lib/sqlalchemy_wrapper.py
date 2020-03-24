import warnings
import collections

from django.conf import settings
from sqlalchemy import create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean
from sqlalchemy import exc as sa_exc
from sqlalchemy.dialects import oracle
from sqlalchemy.dialects import sqlite
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import select, and_, text
from sqlalchemy.sql.expression import Executable, ClauseElement
from sqlalchemy.sql.expression import literal_column, between
from sqlalchemy.schema import Sequence

import threading

from lib.db_oracle import DBOracle
from lib.db_sqlite import DBSqlite
from lib.db_postgresql import DBPostgresql

# class DBOracle:
#     def __init__(self, db):
#         self.db = db

#     def get_string_connection(self):
#         url = (
#                   "oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
#                   "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
#                   "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
#                   "SERVICE_NAME=%(database)s)))"
#               ) % {
#                   'username': self.db['USER'], 'password': self.db['PASSWORD'],
#                   'host': self.db['HOST'], 'port': self.db['PORT'],
#                   'database': self.db['DATABASE']
#               }
#         return url

#     def get_engine(self):
#         return "oracle"

#     def get_dialect(self):
#         return oracle

#     def get_raw_sql_limit(self, offset, limit):
#         return "OFFSET %s ROWS FETCH NEXT %s ROWS ONLY" % (offset, limit)

#     def get_raw_sql_column_properties(self, table, schema=None):
#         sql = "SELECT column_name, data_type FROM all_tab_columns WHERE table_name='%s'" % table
#         if schema:
#             sql += " AND owner='%s'" % schema
#         return sql

#     def get_raw_sql_table_rows(self, table, schema=None):
#         sql = "SELECT NUM_ROWS FROM dba_tables WHERE TABLE_NAME='%s'" % table
#         if schema:
#             sql += " AND owner='%s'" % schema
#         return sql

#     def get_raw_sql_size_table_bytes(self, table, schema=None):
#         sql = "SELECT BYTES FROM dba_segments WHERE segment_type='TABLE' and segment_name='%s'" % table
#         if schema:
#             sql += " AND owner='%s'" % schema
#         return sql

#     def get_raw_sql_number_columns(self, table, schema=None):
#         sql = "SELECT COUNT(*) FROM all_tab_columns WHERE TABLE_NAME = '%s'" % table
#         if schema:
#             sql += " AND owner = '%s'" % schema
#         return sql

#     def get_create_auto_increment_column(self, table, column_name, schema=None):
#         table_name = table
#         if schema is not None and schema is not "":
#             table_name = "%s.%s" % (schema, table)

#         sql = list()
#         sql.append("alter table %(table)s add %(column_name)s number" % {"table": table_name, "column_name": column_name})
#         sql.append("create sequence seq_id" % {"table": table_name, "column_name": column_name})
#         sql.append("update %(table)s set %(column_name)s = seq_id.nextval" % {"table": table_name, "column_name": column_name})
#         sql.append("drop sequence seq_id" % {"table": table_name, "column_name": column_name})

#         return sql

#     def get_table_name(self, table):
#         return table.upper()

#     def get_schema_name(self, schema):
#         return schema.upper()


# class DBSqlite:
#     def __init__(self, db):
#         self.db = db

#     def get_string_connection(self):
#         url = "sqlite:///%s" % self.db['PATH_FILE']
#         return url

#     def get_engine(self):
#         return "sqlite3"

#     def get_dialect(self):
#         return sqlite

#     def get_raw_sql_limit(self, line_number):
#         return "LIMIT(%s)" % line_number

#     def get_table_properties(self, table, schema=None):
#         raise("Implement this method")

#     def get_table_name(self, table):
#         return table

#     def get_schema_name(self, schema):
#         return schema


# classe generica - nao ligada a este problema
class DBBase:
    # Django database engines 
    available_engines = list(['sqlite3', 'oracle', 'postgresql_psycopg2'])

    def __init__(self, database, credentials=None):

        self.connection_data = self.prepare_connection(database)

        if credentials:
            self.connection_data['USER'] = credentials[0]
            self.connection_data['PASSWORD'] = credentials[1]

        self.database = self.set_database(self.connection_data)
        self.engine = create_engine(self.database.get_string_connection())
        self.inspect = inspect(self.engine)

        # Setar o Diaclect especifico deste banco para ser usado com a funcao compile
        self.dialect = self.database.get_dialect()

        with self.engine.connect():
            self.metadata = MetaData(self.engine)

    def prepare_connection(self, db_name):
        connection_data = {}

        if db_name not in settings.DATABASES:
            raise Exception('This configuration does not exist.')

        db_settings_django = settings.DATABASES[db_name]
        connection_data['ENGINE'] = db_settings_django['ENGINE'].split('.')[-1]

        if connection_data['ENGINE'] == 'sqlite3':
            connection_data['PATH_FILE'] = db_settings_django['NAME']

        elif connection_data['ENGINE'] == 'oracle':
            aux = db_settings_django['NAME'].split('/')
            connection_data['DATABASE'] = aux[1]

            aux = aux[0].split(':')
            connection_data['HOST'] = aux[0]
            connection_data['PORT'] = aux[1]
            connection_data['USER'] = db_settings_django['USER']
            connection_data['PASSWORD'] = db_settings_django['PASSWORD']

        elif connection_data['ENGINE'] == 'postgresql_psycopg2':
            print("Tentou conectar com Postgres")
            

        else:
            raise Exception('Unknown database')

        return connection_data

    def set_database(self, db_settings):
        if db_settings['ENGINE'] not in self.available_engines:
            raise Exception('Unavailable engine')

        if db_settings['ENGINE'] == 'sqlite3':
            return DBSqlite(db_settings)

        if db_settings['ENGINE'] == 'oracle':
            return DBOracle(db_settings)

    def get_string_connection(self):
        return self.database.get_string_connection()

    def get_engine(self):
        return self.database.get_engine()

    def get_table_columns(self, table, schema=None):
        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            return [value['name'] for value in self.inspect.get_columns(table, schema)]

    def get_table_properties(self, table, schema=None):
        # Each database has its own rules related to name conventions. Here we
        # suppose that schema and tables names are created without quotes
        table = self.database.get_table_name(table)
        if schema:
            schema = self.database.get_schema_name(schema)

        properties = dict()

        sql = self.database.get_raw_sql_column_properties(table, schema=schema)
        columns = self.fetchall_dict(sql)
        columns.sort(key=lambda k: k['column_name'])
        properties['columns'] = columns

        # sql = self.database.get_raw_sql_table_rows(table, schema=schema)
        # with self.engine.connect() as con:
        #     queryset = con.execute(sql)
        # properties['table_rows'] = queryset.fetchone()[0]
#
        # sql = self.database.get_raw_sql_size_table_bytes(table, schema=schema)
        # with self.engine.connect() as con:
        #     queryset = con.execute(sql)
        # properties['table_bytes'] = queryset.fetchone()[0]
#
        # sql = self.database.get_raw_sql_number_columns(table, schema=schema)
        # with self.engine.connect() as con:
        #     queryset = con.execute(sql)
        # properties['table_num_columns'] = queryset.fetchone()[0]

        return properties

    def create_auto_increment_column(self, table, column_name, schema=None):
        # only create the column if it does not exists.
        if column_name in self.get_table_columns(table, schema=schema):
            return
        sql = self.database.get_create_auto_increment_column(table, column_name, schema=schema)
        with self.engine.connect() as con:
            for _sql in sql:
                con.execute(_sql)

    def get_count(self, table, schema=None):
        with self.engine.connect() as con:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", category=sa_exc.SAWarning)

                table = Table(table, self.metadata,
                              autoload=True, schema=schema)
                stm = select([func.count()]).select_from(table)
                result = con.execute(stm)
                return result.fetchone()[0]

    def table_exists(self, table, schema=None):
        table = self.database.get_table_name(table)
        if schema:
            schema = self.database.get_schema_name(schema)

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            return self.engine.has_table(table, schema)

    def get_table_obj(self, table, schema=None):
        return Table(table, self.metadata, autoload=True, schema=schema)

    @staticmethod
    def get_column_obj(table_obj, column_name):
        return getattr(table_obj.c, column_name)

    def fetchall_dict(self, stm):
        with self.engine.connect() as con:
            queryset = con.execute(stm)
            result = list()
            for row in queryset.fetchall():
                result.append(collections.OrderedDict(row))

            return result

    def fetchone_dict(self, stm):
        with self.engine.connect() as con:
            queryset = con.execute(stm)
            return dict(queryset.fetchone())

    def stm_count(self, stm):
        with self.engine.connect() as con:
            stm_count = stm.with_only_columns([func.count()]).limit(None).offset(None)
            queryset = con.execute(stm_count)
            result = dict(queryset.fetchone())
            return result.get('count_1')

    def select_all(self, table, schema=None):
        with self.engine.connect() as con:
            table = Table(table, self.metadata,
                          autoload=True, schema=schema)
            stm = select([table]).select_from(table)
            result = con.execute(stm)
            return result.fetchall()

    def do_filter(self, table, filters):
        f = list()
        for _filter in filters:
            column = self.get_column_obj(table, _filter['column'])
            op = _filter['op']
            value = _filter['value']
            if op == "=":
                op = "__eq__"

            elif op == "!=":
                op = "__ne__"

            elif op == "<":
                op = "__lt__"

            elif op == "<=":
                op = "__le__"

            elif op == ">":
                op = "__gt__"

            elif op == ">=":
                op = "__ge__"

            elif op == "range":
                # between
                op = None
                value = value.split(",")
                clause = between(column,float(value[0]), float(value[1]))
            else:
                op = '__%s__' % op

            if op is not None:
                f.append(getattr(column, op)(value))
            else:
                f.append(clause)

        return f

    def create_columns_sql_format(self, table, columns):
        t_columns = table
        if columns is not None:
            t_columns = list()
            for col in columns:
                t_columns.append(self.get_column_obj(table, col))
        return t_columns

    # --------------------- Create Table As ------------------------- #
    class CreateTableAs(Executable, ClauseElement):
        def __init__(self, name, query, dialect):
            self.name = name
            self.query = query
            self.dialect = dialect

    @compiles(CreateTableAs)
    def _create_table_as(element, compiler, **kw):
        return "CREATE TABLE %s AS %s" % (
            element.name,
            element.query.compile(dialect=element.dialect.dialect(), compile_kwargs={"literal_binds": True})
        )

    def create_table_as(self, table, stm, schema=None):
        """
        Use this method to Create a new table in the database using a query statement.
        """
        tablename = table

        if schema is not None and schema is not "":
            tablename = "%s.%s" % (schema, table)

        with self.engine.connect() as con:
            create_stm = self.CreateTableAs(tablename, stm, self.dialect)
            print(create_stm)
            return con.execute(create_stm)

    def create_table_raw_sql(self, table, sql, schema=None, timeout=None):
        table_name = table

        if schema is not None and schema is not "":
            table_name = "%s.%s" % (schema, table)

        sql_create_table = text('CREATE TABLE %s AS %s' % (table_name, sql))

        con = self.engine.connect()
        trans = con.begin()
        t = threading.Timer(timeout, con.close)
        if timeout:
            t.start()
        try:
            con.execute(sql_create_table)
            trans.commit()
        except Exception as e:
            trans.rollback()
            raise Exception("Timeout for query execution - %s" % str(e))
        t.cancel()

    # ----------------------------- Drop Table ----------------------
    class DropTable(Executable, ClauseElement):
        def __init__(self, table, schema=None):
            self.schema = schema
            self.table = table

    @compiles(DropTable)
    def _drop_table(element, compiler, **kw):
        _schema = "%s." % element.schema if element.schema is not None and element.schema is not '' else ''
        return "DROP TABLE %s%s" % (_schema, element.table)

    def drop_table(self, table, schema=None):
        """
        Use this method to Drop a table in the database.
        """
        with self.engine.connect() as con:
            drop_stm = self.DropTable(table, schema)
            return con.execute(drop_stm)

    # ------------------------ Filtro Por Posicao ----------------------------------
    def filter_by_coordinate_square(self, property_ra, property_dec, lowerleft, upperright):
        """
        Cria uma clausula Where para fazer uma query por posicao usando um quadrado.
        :param property_ra: nome da coluna que contem a coordenada RA na tabela
        :param property_dec: nomde da coluna que conte a coordencada Dec na tabela
        :param lowerleft: um array com as coordenadas do canto inferior esquerdo list([<RA(deg)>, <Dec(deg)])
        :param upperright: um array com as coordenadas do canto superior direito list([<RA(deg)>, <Dec(deg)])
        :return: list() com as condicoes a serem aplicadas ao statement where
        """
        conditions = list()

        conditions.append(
            and_(between(
                literal_column(str(property_ra)),
                literal_column(str(lowerleft[0])),
                literal_column(str(upperright[0]))
            ), between(
                literal_column(str(property_dec)),
                literal_column(str(lowerleft[1])),
                literal_column(str(upperright[1]))
            ))
        )

        return conditions

    # ------------------------------ Create Table --------------------------------------
    def create_table(self, name, columns, schema=None):
        """

        :param name:
        :param columns:
        :return:
        """

        if (len(name) > 30):
            name = name[:30]

        sa_columns = list()

        for col in columns:
            sa_columns.append(self.create_obj_colum(name, col))

        # columns = list([
        #     Column('user_id', Integer, primary_key=True),
        #     Column('user_name', String(16), nullable=False),
        # ])

        newtable = Table(name, self.metadata, *sa_columns, schema=schema)

        try:

            # PARA OS TESTAR DROPAR ANTES DE CRIAR
            # newtable.drop(self.engine, checkfirst=True)

            # Criar a Tabela so se ela nao existir, se ja existir disparar uma excessao
            newtable.create(self.engine, checkfirst=False)

            return newtable

        except Exception as e:
            raise e

    def create_obj_colum(self, tablename, dcolumn):
        """
        :param tablename:
        :param column:
        :return:
        """

        # Tratar o nome da coluna
        name = dcolumn.get('property')

        # troca espacos por '_', converte para lowercase, remove espacos do final
        name = name.replace(' ', '_').lower().strip().strip('\n')

        # Retirar qualquer caracter que nao seja alfanumerico exceto '_'
        name = ''.join(e for e in name if e.isalnum() or e == '_')

        # coluna nullable por default a menos que seja primary_key
        # ou que tenha sido especificado
        nullable = dcolumn.get('nullable', True)

        if dcolumn.get('primary_key'):

            if self.database.get_engine() == 'oracle':
                if (len(tablename) >= 30):
                    tablename = tablename[:26]

                seq_name = '%s_seq' % tablename

                return Column(name, Integer,
                              Sequence(seq_name),
                              primary_key=dcolumn.get('primary_key'),
                              )

            else:
                return Column(name, Integer,
                              primary_key=dcolumn.get('primary_key'),
                              )

        elif dcolumn.get('type') == 'int':
            return Column(name, Integer,
                          nullable=nullable
                          )

        elif dcolumn.get('type') == 'float':
            return Column(name, Float,
                          nullable=nullable,
                          )

            # TODO Adicionar mais tipos de colunas
            # http: // docs.sqlalchemy.org / en / latest / core / type_basics.html

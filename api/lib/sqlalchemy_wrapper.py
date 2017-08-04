import warnings

from django.conf import settings
from sqlalchemy import create_engine, inspect, MetaData, func, Table
from sqlalchemy import exc as sa_exc
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import select
from sqlalchemy.sql.expression import Executable, ClauseElement


class DBOracle:
    def __init__(self, db):
        self.db = db

    def get_string_connection(self):
        url = (
                  "oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
                  "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
                  "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
                  "SERVICE_NAME=%(database)s)))"
              ) % {
                  'username': self.db['USER'], 'password': self.db['PASSWORD'],
                  'host': self.db['HOST'], 'port': self.db['PORT'],
                  'database': self.db['DATABASE']
              }
        return url

    def get_engine(self):
        return "oracle"


class DBSqlite:
    def __init__(self, db):
        self.db = db

    def get_string_connection(self):
        url = "sqlite:///%s" % self.db['PATH_FILE']
        return url

    def get_engine(self):
        return "sqlite3"


# classe generica - nao ligada a este problema
class DBBase:
    available_engines = list(['sqlite3', 'oracle'])

    def __init__(self, database):

        self.connection_data = self.prepare_connection(database)
        self.database = self.set_database(self.connection_data)
        self.engine = create_engine(self.database.get_string_connection())
        self.inspect = inspect(self.engine)

        # self.db = self.engine.connect

        with self.engine.connect():
            self.metadata = MetaData(self.engine)

    @staticmethod
    def prepare_connection(db_name):
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
                result.append(dict(row))

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

    @staticmethod
    def do_filter(table, filters):
        f = list()
        for _filter in filters:
            op = '__%s__' % _filter['op']
            column = DBBase.get_column_obj(table, _filter['column'])
            f.append(getattr(column, op)(_filter['value']))
        return f

    @staticmethod
    def create_columns_sql_format(table, columns):
        t_columns = table
        if columns is not None:
            t_columns = list()
            for col in columns:
                t_columns.append(DBBase.get_column_obj(table, col))
        return t_columns

    # --------------------- Create Table As ------------------------- #
    class CreateTableAs(Executable, ClauseElement):
        def __init__(self, name, query):
            self.name = name
            self.query = query

    @compiles(CreateTableAs)
    def _create_table_as(element, compiler, **kw):
        return "CREATE TABLE %s AS %s" % (
            element.name,
            compiler.process(element.query)
        )

    def create_table_as(self, table, stm, schema=None):
        """
        Use this method to Create a new table in the database using a query statement.
        """

        tablename = table

        if schema is not None and schema is not "":
            tablename = "%s.%s" % (table, schema)

        with self.engine.connect() as con:
            create_stm = self.CreateTableAs(tablename, stm)
            return con.execute(create_stm)

    # ----------------------------- Drop Table ----------------------
    class DropTable(Executable, ClauseElement):
        def __init__(self, table, schema=None):
            self.schema = schema
            self.table = table

    @compiles(DropTable)
    def _drop_table(element, compiler, **kw):
        _schema = "%s." % element.schema if element.schema is not None else ''
        return "DROP TABLE %s%s" % (_schema, element.name)

    def drop_table(self, table, schema=None):
        """
        Use this method to Drop a table in the database.
        """
        with self.engine.connect() as con:
            drop_stm = self.DropTable(table, schema)
            return con.execute(drop_stm)

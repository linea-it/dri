from sqlalchemy import create_engine, inspect, MetaData, func, Table
from sqlalchemy.sql import select


class DBOracle:
    def __init__(self, db):
        self.db = db

    def get_string_connection(self):
        url = ("oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
              "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
              "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
              "SERVICE_NAME=%(database)s)))") %\
              {"username": self.db['USER'], 'password': self.db['PASSWORD'],
               'host': self.db['HOST'], 'port': self.db['PORT'],
               'database': self.db['DATABASE']}
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

    def __init__(self, db_settings):
        self.database = self.set_database(db_settings)
        self.engine = create_engine(self.database.get_string_connection())
        self.inspect = inspect(self.engine)

        with self.engine.connect():
            self.metadata = MetaData(self.engine)

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
        return [value['name'] for value in self.inspect.get_columns(table, schema)]

    def get_count(self, table, schema=None):
        with self.engine.connect() as con:
            table = Table(table, self.metadata,
                          autoload=True, schema=schema)
            stm = select([func.count()]).select_from(table)
            result = con.execute(stm)
            return result.fetchone()[0]

    def table_exists(self, table, schema=None):
        return self.engine.has_table(table, schema)

    def get_table_obj(self, table, schema=None):
        return Table(table, self.metadata, autoload=True, schema=schema)

    @staticmethod
    def get_column_obj(table_obj, column_name):
        return getattr(table_obj.c, column_name)

    def fetchall_dict(self, stm, columns):
        with self.engine.connect() as con:
            result = con.execute(stm)
            return [
                dict(zip(columns, row))
                for row in result.fetchall()
                ]

    def select_all(self, table, schema=None):
        with self.engine.connect() as con:
            table = Table(table, self.metadata,
                          autoload=True, schema=schema)
            stm = select([table]).select_from(table)
            result = con.execute(stm)
            return result.fetchall()

    @staticmethod
    def do_filter(table, filters):
        f = []
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

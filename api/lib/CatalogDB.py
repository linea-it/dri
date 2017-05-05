from dri.settings.local_vars import *


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
        print(self.database.get_string_connection())
        print("!!!!!")
        self.engine = create_engine(self.database.get_string_connection())
        self.inspect = inspect(self.engine)

        with self.engine.connect():
            self.metadata = MetaData(self.engine)

        print(self.table_exists('catalog_rating'))
        print(self.table_exists('catalog_rating22'))
        print('******')
        print(self.select_all('catalog_rating'))
        print(self.get_count('catalog_rating'))
        print(self.get_table_columns('catalog_rating'))
        print(self.inspect.get_table_names())
        print(self.inspect.get_schema_names())

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

    def select_all(self, table, schema=None):
        with self.engine.connect() as con:
            table = Table(table, self.metadata,
                          autoload=True, schema=schema)
            stm = select([table]).select_from(table)
            result = con.execute(stm)
            return result.fetchall()


class CatalogDB:
    def __init__(self, db='catalog'):
        self.database = DBBase(self.prepare_connection(db))


    def prepare_connection(self, db):
        connection_data = {}

        if db not in DATABASES:
            raise Exception('This configuration does not exist.')

        db_settings_django = DATABASES[db]
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


import warnings

from django.conf import settings
from sqlalchemy import create_engine, inspect, MetaData, func, Table, Column, Integer, String, Float, Boolean
from sqlalchemy import exc as sa_exc
from sqlalchemy.dialects import oracle
from sqlalchemy.dialects import sqlite
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import select, and_
from sqlalchemy.sql.expression import Executable, ClauseElement
from sqlalchemy.sql.expression import literal_column, between


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

    def get_dialect(self):
        return oracle


class DBSqlite:
    def __init__(self, db):
        self.db = db

    def get_string_connection(self):
        url = "sqlite:///%s" % self.db['PATH_FILE']
        return url

    def get_engine(self):
        return "sqlite3"

    def get_dialect(self):
        return sqlite


# classe generica - nao ligada a este problema
class DBBase:
    available_engines = list(['sqlite3', 'oracle'])

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

        # self.db = self.engine.connect
        self.con = self.engine.connect

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

    def do_filter(self, table, filters):
        f = list()
        for _filter in filters:
            op = _filter['op']

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

            else:
                op = '__%s__' % op

            column = self.get_column_obj(table, _filter['column'])
            f.append(getattr(column, op)(_filter['value']))
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

        sa_columns = list()

        for col in columns:
            sa_columns.append(self.create_obj_colum(col))

        # columns = list([
        #     Column('user_id', Integer, primary_key=True),
        #     Column('user_name', String(16), nullable=False),
        # ])

        newtable = Table(name, self.metadata, *sa_columns, schema=schema)

        try:

            # TODO PARA OS TESTES DROPAR ANTES DE CRIAR
            newtable.drop(self.engine, checkfirst=True)

            # Criar a Tabela so se ela nao existir, se ja existir disparar uma excessao
            newtable.create(self.engine, checkfirst=False)

            return newtable

        except Exception as e:
            raise e

    def create_obj_colum(self, dcolumn):
        """

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
            nullable = False

        if dcolumn.get('type') == 'int':
            return Column(name, Integer,
                          primary_key=dcolumn.get('primary_key'),
                          nullable=nullable
                          )

        elif dcolumn.get('type') == 'float':
            return Column(name, Float,
                          nullable=nullable,
                          )

        # TODO Adicionar mais tipos de colunas
        #http: // docs.sqlalchemy.org / en / latest / core / type_basics.html




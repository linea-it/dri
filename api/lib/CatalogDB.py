from django.db import connections
from collections import namedtuple


class CatalogDB:
    available_engines = list(['sqlite3'])
    db = None
    engine = None
    cursor = None

    def __init__(self, db='catalog'):
        print("-------------- Init -------------- ")
        # self.db = db
        self.setDb(db)
        print("-------------- Depois do set -------------- ")

    def setDb(self, db):
        print("-------------- Setter -------------- ")
        if db != 'default':
            try:
                print("-------------- criar o cursor -------------- ")
                # Tenta conectar ao banco de dados se conseguir retorna o cursor.
                self.cursor = connections[db].cursor()
            except Exception as error:
                print(error)

            # Recupera a engine a ser usada no banco de dados
            self.engine = self.__getDbEngine()
            print("-------------- Engine -------------- ")
            print(self.engine)

            #  So seta o banco se tiver conseguido criar o cursor e recuperado a engine.
            self.db = db

        else:
            raise Exception('The database default can not be used as a catalog database.')

    def __getDbEngine(self):
        # Recuperar no dict settings DATABASE a configuracao do banco de dados atual
        complete_engine = self.cursor.db.settings_dict.get('ENGINE')

        # a string comple e esta django.db.backends.sqlite3 com o split usamos so a ultima parte sqlite3
        engine = complete_engine.split('.').pop()

        # checar se a engine esta na lista de engines suportadas como banco de catalogos
        if engine in self.available_engines:
            return engine
        else:
            raise Exception("The engine %s is not available to be used as database for catalogs."
                            "The available engines are these: %s" % (engine, ', '.join(self.available_engines)))

    def execute(self, query, params=None):
        if (params is None):
            return self.cursor.execute(query)
        else:
            return self.cursor.execute(query, params)

    def fetchall(self, query, params=None):
        return self.execute(query, params).fetchall()

    def fetchone(self, query, params=None):
        return self.execute(query, params).fetchone()

    def fetchall_dict(self, query, params=None):
        """
        Return all rows as a dict
        """
        cursor = self.execute(query, params)
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    def fetchall_namedtuple(self, query, params=None):
        """
        Return all rows from as a namedtuple"
        """
        cursor = self.execute(query, params)
        desc = cursor.description
        nt_result = namedtuple('Result', [col[0] for col in desc])
        return [nt_result(*row) for row in cursor.fetchall()]

    def get_table_columns(self, table):
        """
        Return all columns in a table"
        """
        query = "SELECT * FROM %s LIMIT 1" % table
        cursor = self.execute(query)
        columns = [col[0] for col in cursor.description]

        return columns

    def query(self, table, schema=None, columns=None, filters=None, order_by=None, limit=None, offset=None, dict=True):

        sql_columns = '*'
        sql_from = ''
        sql_where = ''
        sql_sort = ''
        sql_limit = ''
        sql_count = None

        if schema:
            sql_from = '%s.%s' %(schema, table)
        else:
            sql_from = table

        # Lista de colunas da tabela
        tbl_columns = self.get_table_columns(sql_from)

        if columns:
            sql_columns = ', '.join(self.__check_columns(tbl_columns, columns))

        # if filters:
        #     sql_filter = self.parseFilter(filters, checkColumns=tbl_columns)

        # if order_by:
        #     sql_sort = self.parseSort(order_by, tbl_columns)

        if limit:
            sql_limit = self.parseLimit(limit, offset)

        sql = ("SELECT %s FROM %s %s %s %s") % (sql_columns, sql_from, sql_where, sql_sort, sql_limit)

        if limit:
            sql_count = ("SELECT COUNT(*) as count FROM %s %s %s") % (sql_from, sql_where, sql_sort)

        print("SQL: %s" % sql)
        print("SQL Count: %s" % sql_count)

        if dict:
            rows = self.fetchall_dict(sql)
        else:
            rows = self.fetchall(sql)

        if sql_count:
            count = self.fetchall(sql_count)[0][0]
            print(count)
            print("Count: %s" % count)
        else:
            count = len(rows)

        return rows, count

    def __check_columns(self, a, b):
        """
        Compara duas listas de coluna e verifica se as colunas da lista b estao na lista a
        caso nao esteja lanca uma excessao se todas as colunas da b estiverem em a retorna a lista b
        """
        if isinstance(a, list) and isinstance(b, list):
            for col in b:
                if col not in a:
                    raise Exception("The column %s does not exist." % col)

            return b
        else:
            raise Exception("The parameter columns must be a list.")


    def parseLimit(self, limit, offset=None):
        """
        Gera string usada para paginar os resultados
        """
        slimit = str()

        print(limit)

        if limit is None:
            return ''
        try:
            limit = int(limit)
            if offset:
                offset = int(offset)

            if (isinstance(limit, int)) and (limit > 0):
                slimit = "LIMIT %s" % limit

                if isinstance(offset, int):
                    slimit += " OFFSET %s" % offset

                return slimit
            else:
                raise Exception('Limit needs to be integer greater than zero.')

        except Exception as error:
            raise Exception('Limit needs to be integer greater than zero. Offset must be integer.')

# class SqliteWrapper:

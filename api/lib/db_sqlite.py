from sqlalchemy.dialects import sqlite


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

    def accept_bulk_insert(self):
        return False

    def get_raw_sql_limit(self, line_number):
        return "LIMIT(%s)" % line_number

    def get_table_properties(self, table, schema=None):
        # TODO: Criar uma query que retorne a lista de colunas e o tipo.
        # esta funcao tem esses dados https://www.sqlite.org/pragma.html#pragma_table_info
        raise("Method not implemented 'get_table_properties'")

    def get_table_name(self, table):
        return table

    def get_schema_name(self, schema):
        return schema

    def get_raw_sql_table_rows(self, table, schema=None):
        raise Exception("Method not implemented 'get_raw_sql_table_rows'")

    def get_raw_sql_size_table_bytes(self, table, schema=None):
        raise Exception("Method not implemented 'get_raw_sql_size_table_bytes'")

    def get_raw_sql_number_columns(self, table, schema=None):
        raise Exception("Method not implemented 'get_raw_sql_number_columns'")

    def get_create_auto_increment_column(self, table, column_name, schema=None):
        raise Exception("Method not implemented 'get_create_auto_increment_column'")

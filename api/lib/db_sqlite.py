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

    def get_raw_sql_limit(self, line_number):
        return "LIMIT(%s)" % line_number

    def get_table_properties(self, table, schema=None):
        raise("Implement this method")

    def get_table_name(self, table):
        return table

    def get_schema_name(self, schema):
        return schema
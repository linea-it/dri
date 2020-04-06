from sqlalchemy.dialects import postgresql


class DBPostgresql:
    def __init__(self, db):
        self.db = db

    def get_string_connection(self):
        url = ("postgresql+psycopg2://%(username)s:%(password)s@%(host)s:%(port)s/%(database)s") % {
            'username': self.db['USER'],
            'password': self.db['PASSWORD'],
            'host': self.db['HOST'],
            'port': self.db['PORT'],
            'database': self.db['DATABASE']
        }
        return url

    def get_engine(self):
        return "postgresql_psycopg2"

    def get_dialect(self):
        return postgresql

    def get_raw_sql_limit(self, offset, limit):
        return "OFFSET %s LIMIT %s" % (offset, limit)

    def get_raw_sql_column_properties(self, table, schema=None):
        sql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '%s'" % table
        if schema:
            sql += " AND table_schema = '%s'" % schema
        return sql

    def get_raw_sql_table_rows(self, table, schema=None):
        if schema:
            sql = "SELECT reltuples FROM pg_class WHERE oid = '%s.%s'::regclass" % (schema, table)
        else:
            sql = "SELECT reltuples FROM pg_class WHERE relname='%s'" % table
        return sql

    def get_raw_sql_size_table_bytes(self, table, schema=None):
        sql = "SELECT pg_total_relation_size(relid) as size_in_bytes  FROM pg_catalog.pg_statio_user_tables WHERE relname = '%s'" % table
        if schema:
            sql += " AND schemaname='%s'" % schema
        return sql

    def get_raw_sql_number_columns(self, table, schema=None):
        where = "WHERE table_name = '%s'" % table
        if schema:
            where += " AND table_schema = '%s'" % schema

        sql = "SELECT count(*) as column_count FROM information_schema.columns %s GROUP by table_name order by column_count desc" % where

        return sql

    def get_create_auto_increment_column(self, table, column_name, schema=None):
        raise Exception("Method not implemented 'get_create_auto_increment_column'")

    def get_create_auto_increment_column(self, table, column_name, schema=None):
        table_name = table
        if schema is not None and schema is not "":
            table_name = "%s.%s" % (schema, table)

        sql = list()
        sql.append("CREATE INDEX %(table)s_%(column)s_idx ON %(table)s USING btree (%(column)s);" % {
            "table": table_name,
            "column": column_name})

        return sql

    def get_table_name(self, table):
        return table

    def get_schema_name(self, schema):
        return schema

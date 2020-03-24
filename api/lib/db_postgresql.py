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

    # def get_raw_sql_limit(self, offset, limit):
    #     return "OFFSET %s ROWS FETCH NEXT %s ROWS ONLY" % (offset, limit)

    # def get_raw_sql_column_properties(self, table, schema=None):
    #     sql = "SELECT column_name, data_type FROM all_tab_columns WHERE table_name='%s'" % table
    #     if schema:
    #         sql += " AND owner='%s'" % schema
    #     return sql

    # def get_raw_sql_table_rows(self, table, schema=None):
    #     sql = "SELECT NUM_ROWS FROM dba_tables WHERE TABLE_NAME='%s'" % table
    #     if schema:
    #         sql += " AND owner='%s'" % schema
    #     return sql

    # def get_raw_sql_size_table_bytes(self, table, schema=None):
    #     sql = "SELECT BYTES FROM dba_segments WHERE segment_type='TABLE' and segment_name='%s'" % table
    #     if schema:
    #         sql += " AND owner='%s'" % schema
    #     return sql

    # def get_raw_sql_number_columns(self, table, schema=None):
    #     sql = "SELECT COUNT(*) FROM all_tab_columns WHERE TABLE_NAME = '%s'" % table
    #     if schema:
    #         sql += " AND owner = '%s'" % schema
    #     return sql

    # def get_create_auto_increment_column(self, table, column_name, schema=None):
    #     table_name = table
    #     if schema is not None and schema is not "":
    #         table_name = "%s.%s" % (schema, table)

    #     sql = list()
    #     sql.append("alter table %(table)s add %(column_name)s number" % {"table": table_name, "column_name": column_name})
    #     sql.append("create sequence seq_id" % {"table": table_name, "column_name": column_name})
    #     sql.append("update %(table)s set %(column_name)s = seq_id.nextval" % {"table": table_name, "column_name": column_name})
    #     sql.append("drop sequence seq_id" % {"table": table_name, "column_name": column_name})

    #     return sql

    def get_table_name(self, table):
        return table

    def get_schema_name(self, schema):
        return schema

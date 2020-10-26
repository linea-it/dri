from sqlalchemy.dialects import oracle


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
            'username': self.db['USER'],
            'password': self.db['PASSWORD'],
            'host': self.db['HOST'],
            'port': self.db['PORT'],
            'database': self.db['DATABASE']
        }
        return url

    def get_engine(self):
        return "oracle"

    def get_dialect(self):
        return oracle

    def get_raw_sql_limit(self, offset, limit):
        return "OFFSET %s ROWS FETCH NEXT %s ROWS ONLY" % (offset, limit)

    def get_raw_sql_column_properties(self, table, schema=None):
        sql = "SELECT column_name, data_type FROM all_tab_columns WHERE table_name='%s'" % table
        if schema:
            sql += " AND owner='%s'" % schema
        return sql

    def get_raw_sql_table_rows(self, table, schema=None):
        sql = "SELECT NUM_ROWS FROM dba_tables WHERE TABLE_NAME='%s'" % table
        if schema:
            sql += " AND owner='%s'" % schema
        return sql

    def get_raw_sql_size_table_bytes(self, table, schema=None):
        sql = "SELECT BYTES FROM dba_segments WHERE segment_type='TABLE' and segment_name='%s'" % table
        if schema:
            sql += " AND owner='%s'" % schema
        return sql

    def get_raw_sql_number_columns(self, table, schema=None):
        sql = "SELECT COUNT(*) FROM all_tab_columns WHERE TABLE_NAME = '%s'" % table
        if schema:
            sql += " AND owner = '%s'" % schema
        return sql

    def get_create_auto_increment_column(self, table, column_name, schema=None):
        table_name = table
        if schema is not None and schema is not "":
            table_name = "%s.%s" % (schema, table)

        sql = list()
        # Adiciona uma nova coluna vazia a tabela.
        sql.append("alter table %(table)s add %(column_name)s number" % {"table": table_name, "column_name": column_name})
        # Cria uma sequencia (Autoincrement em outros bancos).
        sql.append("create sequence %(table)s_seq" % {"table": table_name})
        # Atualiza todas as linhas da tabela na coluna criada com o valor do autoincrement.
        sql.append("update %(table)s set %(column_name)s = %(table)s_seq.nextval" % {"table": table_name, "column_name": column_name})
        # Drop Sequence que foi criada anteriormente.
        sql.append("drop sequence %(table)s_seq" % {"table": table_name})
        # Altera a coluna criada e transforma ela em Primary Key
        sql.append("alter table %(table)s add CONSTRAINT %(table)s_pk PRIMARY KEY ( %(column_name)s )" % {"table": table_name, "column_name": column_name})

        return sql

    def get_table_name(self, table):
        return table.upper()

    def get_schema_name(self, schema):
        return schema.upper()

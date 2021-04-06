from sqlalchemy import Column, create_engine
from sqlalchemy.dialects import oracle
from sqlalchemy.sql import and_, or_
from sqlalchemy.sql.expression import between, literal_column


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
        return create_engine(
            self.get_string_connection(),
            # Fixed: https://ticket.linea.gov.br/ticket/13037 and https://github.com/linea-it/dri/issues/1341
            # Esta opção coerce_to_decimal=False é necessária para
            # evitar erro causado por valores Infinity.
            # https://docs.sqlalchemy.org/en/14/dialects/oracle.html#precision-numerics
            coerce_to_decimal=False
        )

    def get_engine_name(self):
        return "oracle"

    def get_dialect(self):
        return oracle

    def accept_bulk_insert(self):
        return False

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

    def get_condition_square(self, lowerleft, upperright, property_ra, property_dec):

        # Tratar RA > 360
        llra = float(lowerleft[0])
        lldec = float(lowerleft[1])

        urra = float(upperright[0])
        urdec = float(upperright[1])

        if llra > 360:
            llra = llra - 360

        if urra > 360:
            urra = urra - 360

        # Verificar se o RA 0 esta entre llra e urra
        if (llra < 0 and urra < 0) or (llra > 0 and urra > 0):
            # RA 0 nao esta na area da consulta pode se usar o between simples

            # BETWEEN llra and urra
            raCondition = between(
                Column(str(property_ra)),
                literal_column(str(llra)),
                literal_column(str(urra))
            )

        else:
            # Area de interesse passa pelo RA 0 usar 2 between separando ate 0 e depois de 0

            llralt0 = 360 - (llra * -1)

            # Solucao para catalogos com RA 0 - 360
            raLTZero = between(
                Column(str(property_ra)),
                literal_column(str(llralt0)),
                literal_column("360")
            )

            raGTZero = between(
                Column(str(property_ra)),
                literal_column("0"),
                literal_column(str(urra))
            )

            raCondition360 = or_(raLTZero, raGTZero).self_group()

            # Solucao para catalogos com RA -180 a 180
            raCondition180 = between(
                Column(str(property_ra)),
                literal_column(str(llra)),
                literal_column(str(urra))
            )

            raCondition = or_(raCondition360, raCondition180).self_group()

        decCondition = between(
            Column(str(property_dec)),
            literal_column(str(lldec)),
            literal_column(str(urdec))
        )

        return and_(raCondition, decCondition).self_group()

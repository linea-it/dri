from lib.BaseWrapper import BaseWrapper

class SqliteWrapper(BaseWrapper):

    def get_table_columns(self, table):
        """
        Return all columns in a table"
        """
        query = "SELECT * FROM %s LIMIT 1" % table

        cursor = self.execute(query)
        columns = [col[0] for col in cursor.description]

        return columns

    def query(self, table, schema=None, columns=None, filters=None, order_by=None, limit=None, offset=None, joins=None,
              dict=True):

        sql_columns = '*'
        sql_from = ''
        sql_where = ''
        sql_sort = ''
        sql_limit = ''
        sql_count = None
        join_cols = list()

        if schema:
            tablename = '%s.%s' % (schema, table)
        else:
            tablename = table

        # Lista de colunas da tabela
        tbl_columns = self.get_table_columns(tablename)
        if columns:
            sql_columns = ', '.join(self.__check_columns(tbl_columns, columns))
        else:
            sql_columns = ', '.join(tbl_columns)

        if joins and len(joins) > 0:
            tablename = "%s a" % tablename
            sql_from = tablename
            for join in joins:
                alias = join.get('alias')
                sql_join = " %(operation)s JOIN %(tablename)s %(alias)s ON (%(condition)s) " % join
                sql_from += sql_join

                for c in join.get('columns', list()):
                    join_cols.append(alias + '.' + c)
        else:
            sql_from = tablename

        if len(join_cols):
            cls = list()

            for c in tbl_columns:
                cls.append('a.' + c)
            for c in join_cols:
                cls.append(c)

            sql_columns = ', '.join(cls)

        if limit:
            sql_limit = self.do_paginate(limit, offset)
            sql_count = ("SELECT COUNT(*) as count FROM %s %s") % (sql_from, sql_where)

        if order_by:
            sql_sort = self.do_order(order_by)

        sql = ("SELECT %s FROM %s %s %s %s") % (sql_columns, sql_from, sql_where,  sql_sort, sql_limit)

        print("Query: %s" % sql)

        rows = list()
        if dict:
            rows = self.fetchall_dict(sql)
        else:
            rows = self.fetchall(sql)

        if sql_count:
            count = self.fetchall(sql_count)[0][0]
        else:
            count = len(rows)

        return rows, count

    def do_paginate(self, limit, offset=None):
        """
        Gera string usada para paginar os resultados
        """
        slimit = str()

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


    def do_order(self, order_by):
        """
        Gera string usada para Ordernar os resultados
        """
        sql_sort = str()

        direction = 'ASC'

        if order_by is None:
            return ''

        if order_by.find('-', 0, 1) >= 0:
            direction = 'DESC'
            order_by = order_by.replace('-', '', 1)

        sql_sort = "ORDER BY %s %s" % (order_by, direction)

        return sql_sort


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

    def table_exists(self, schema, table):
        tablename = self.get_tablename(schema, table)

        query = "SELECT * FROM %s LIMIT 1" % tablename

        try:
            cursor = self.execute(query)

            return True

        except:
            return False
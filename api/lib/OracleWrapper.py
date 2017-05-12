from lib.BaseWrapper import BaseWrapper


class OracleWrapper(BaseWrapper):
    is_filtered = False

    def get_table_columns(self, table):
        """
        Return all columns in a table"
        """
        query = "SELECT * FROM %s WHERE ROWNUM <= 1" % table
        cursor = self.execute(query)
        columns = [col[0] for col in cursor.description]

        return columns

    def query(self, table, schema=None, columns=None, filters=None, order_by=None, limit=None, offset=None, joins=None,
              dict=True, return_count=True):

        sql_columns = '*'
        sql_from = ''
        sql_where = ''
        sql_sort = ''
        sql_limit = ''
        sql_count = None
        join_cols = list()
        join_cols_whitout_alias = list()

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
                    join_cols_whitout_alias.append(c)
        else:
            sql_from = tablename

        cls = list()
        if len(join_cols):
            for c in tbl_columns:
                cls.append('a.' + c)
            for c in join_cols:
                cls.append(c)

            sql_columns = ', '.join(cls)
        else:
            cls = tbl_columns

        if filters:
            sql_where = self.do_filters(filters, cls)


        if limit and offset:

            if not order_by:
                order_colun = cls[0]
            else:
                order_colun = order_by

            order_colun, direction = self.do_order(order_colun, False, cls)
            order = self.do_order(order_by, cls)

            limit = int(limit)
            start = int(offset)
            end = start + limit

            if filters:
                sql_where = "WHERE %s" % sql_where

            sql_main = ("SELECT /*+ first_rows(%s) */ %s, row_number() OVER (ORDER BY %s %s) rownumber FROM %s %s ") % (
                limit, sql_columns, order_colun, direction, sql_from, sql_where)

            sql_base = (
                       "SELECT * "
                       "FROM (%s) "
                       "WHERE rownumber BETWEEN %s and %s "
                   ) % (sql_main, start, end)


            sql_count = ("SELECT COUNT(*) as count FROM %s %s") % (tablename, sql_where)

        else:
            if limit:
                sql_limit = self.do_limit(limit)

                if filters:
                    sql_count = ("SELECT COUNT(*) as count FROM %s WHERE %s") % (sql_from, sql_where)
                    sql_base = ("SELECT %s FROM %s %s AND %s %s") % (sql_columns, sql_from, sql_limit, sql_where, sql_sort)
                else:
                    sql_count = ("SELECT COUNT(*) as count FROM %s ") % (sql_from)
                    sql_base = ("SELECT %s FROM %s %s %s") % (sql_columns, sql_from, sql_limit, sql_sort)

            else:
                sql_base = ("SELECT %s FROM %s WHERE %s %s %s") % (sql_columns, sql_from, sql_where, sql_limit, sql_sort)

            if order_by:
                sql_sort = self.do_order(order_by, tbl_columns, cls)

        sql = sql_base
        print(sql)
        rows = list()
        if dict:
            rows = self.fetchall_dict(sql)
        else:
            rows = self.fetchall(sql)

        if sql_count and return_count:
            print(sql_count)
            count = self.fetchall(sql_count)[0][0]
        else:
            count = len(rows)

        # Tratamento para retirar o ROWNUM do resultado
        flag_pop_rn = False
        for row in rows:
            if 'ROWNUMBER' in row and flag_pop_rn is False:
                flag_pop_rn = True

            if flag_pop_rn:
                row.pop("ROWNUMBER", None)

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

    def do_paginate(self, limit, offset, columns=None, filters=None, property_id=None):

        pass

    def do_limit(self, limit):
        """

        """
        sql_limit = str()
        if limit is None:
            return ''
        try:
            limit = int(limit)
            if (isinstance(limit, int)) and (limit > 0):
                sql_limit = "WHERE ROWNUM <=%s" % limit
                return sql_limit
            else:
                raise Exception('Limit needs to be integer greater than zero.')

        except Exception as error:
            raise Exception('Limit needs to be integer greater than zero. Offset must be integer.')

    def do_order(self, order_by, return_str=True, cls=None):
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

        # Adiciona alias a coluna order by
        if cls is not None:
            for a in cls:
                col = a.split('.')
                col_name = col[len(col) - 1]
                alias = None

                if len(col) > 1:
                    alias = col[0]

                if order_by == col_name:
                    if alias is not None:
                        order_by = "%s.%s" % (alias, order_by)
                    break

        sql_sort = "ORDER BY %s %s" % (order_by, direction)

        if return_str:
            return sql_sort
        else:
            return order_by, direction

    def table_exists(self, schema, table):
        tablename = self.get_tablename(schema, table)

        query = "SELECT * FROM %s WHERE ROWNUM <= 1" % tablename

        try:
            cursor = self.execute(query)

            return True

        except:
            return False

    def do_filters(self, filters, columns):
        sql_where = ''
        clauses = list()
        for filter in filters:
            if 'property' in filter:
                property = filter.get('property')
                if (property not in columns):
                    raise Exception('%s is not a valid property.' % property)

                clause = self.get_clauses(filter)
                if clause:
                    clauses.append(clause)

            elif 'conditions' in filter:
                conditions = list()
                for cond in filter.get('conditions'):
                    conditions.append(
                        self.do_filters(list([cond]), columns)
                    )
                operator = ' %s ' % filter.get('operator')
                condition = '( %s )' % operator.join(conditions)
                clauses.append(condition)

        if len(clauses) > 1:
            sql_where = ' AND '.join(clauses)
        else:
            sql_where = ''.join(clauses)

        return sql_where

    def get_clauses(self, filter):

        property = filter.get('property')
        operator = filter.get('operator', "=")
        value = filter.get('value')
        clause = None
        if operator.lower() == 'between':
            clause = '%s BETWEEN %s AND %s' % (property, value[0], value[1])

        else:
            clause = '%s %s %s' % (property, operator, value)

        return clause


from lib.BaseWrapper import BaseWrapper

class OracleWrapper(BaseWrapper):

    is_filtered = False

    def get_table_columns(self, table):
        """
        Return all columns in a table"
        """
        query = "SELECT * FROM %s WHERE ROWNUM <= 1;" % table
        cursor = self.execute(query)
        columns = [col[0] for col in cursor.description]

        return columns

    # def query(self, table, schema=None, columns=None, filters=None, order_by=None, limit=None, offset=None, dict=True):
    #
    #     sql_columns = '*'
    #     sql_from = ''
    #     sql_where = ''
    #     sql_sort = ''
    #     sql_limit = ''
    #     sql_count = None
    #
    #     if schema:
    #         sql_from = '%s.%s' %(schema, table)
    #     else:
    #         sql_from = table
    #
    #     # Lista de colunas da tabela
    #     tbl_columns = self.get_table_columns(sql_from)
    #     tbl_columns = list()
    #     if columns:
    #         sql_columns = ', '.join(self.__check_columns(tbl_columns, columns))
    #
    #     # if filters:
    #     #     sql_filter = self.parseFilter(filters, checkColumns=tbl_columns)
    #
    #     # if order_by:
    #     #     sql_sort = self.parseSort(order_by, tbl_columns)
    #
    #     # if limit:
    #     #     sql_limit = self.wrapper.parseLimit(limit, offset, is_filtered)
    #
    #     sql = ("SELECT %s FROM %s %s %s %s;") % (sql_columns, sql_from, sql_where, sql_sort, sql_limit)
    #
    #     if limit:
    #         sql_count = ("SELECT COUNT(*) as count FROM %s %s %s") % (sql_from, sql_where, sql_sort)
    #
    #     print("SQL: %s" % sql)
    #     print("SQL Count: %s" % sql_count)
    #
    #     if dict:
    #         rows = self.fetchall_dict(sql)
    #     else:
    #         rows = self.fetchall(sql)
    #
    #     if sql_count:
    #         count = self.fetchall(sql_count)[0][0]
    #         print(count)
    #         print("Count: %s" % count)
    #     else:
    #         count = len(rows)
    #
    #     return rows, count

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



    def do_limit(self, limit, offset=None, is_filtered=False):
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
                slimit = "WHERE ROWNUM <=%s" % limit

                # if isinstance(offset, int):
                #     slimit += " OFFSET %s" % offset

                return slimit
            else:
                raise Exception('Limit needs to be integer greater than zero.')

        except Exception as error:
            raise Exception('Limit needs to be integer greater than zero. Offset must be integer.')


    # def do_order(self, limit, offset=None, is_filtered=False):
    #     """
    #     Gera string usada para paginar os resultados
    #     """
    #     slimit = str()
    #
    #     print(limit)
    #
    #     if limit is None:
    #         return ''
    #     try:
    #         limit = int(limit)
    #         if offset:
    #             offset = int(offset)
    #
    #         if (isinstance(limit, int)) and (limit > 0):
    #             slimit = "WHERE ROWNUM <=%s" % limit
    #
    #             # if isinstance(offset, int):
    #             #     slimit += " OFFSET %s" % offset
    #
    #             return slimit
    #         else:
    #             raise Exception('Limit needs to be integer greater than zero.')
    #
    #     except Exception as error:
    #         raise Exception('Limit needs to be integer greater than zero. Offset must be integer.')
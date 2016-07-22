import easyaccess as ea
import numpy as np
import pandas as pd
import simplejson as json
from datetime import datetime, timedelta
from pprint import pprint

class OracleDB:

    def __init__(self):
        self.connection = ea.connect()
        self.cursor= self.connection.cursor()

    def fetch_all(self,query):
        self.cursor.execute(query)
        header = [item[0] for item in self.cursor.description]
        rows = self.cursor.fetchall()
        return rows

    def fetch_one(self,query):
        self.cursor.execute(query)
        header = [item[0] for item in self.cursor.description]
        row = self.cursor.fetchone()
        return row

    def fetchall_dict(self,query):
        self.cursor.execute(query)
        header = [item[0] for item in self.cursor.description]
        rows = self.cursor.fetchall()

        l = list()
        d = dict()
        result_dict = dict()

        for row in rows:
            item = dict(zip(header, row))
            l.append(item)
            result_dict = l

        return result_dict

    def fetch_scalar(self,query,col=0):
        self.cursor.execute(query)
        row = self.fetch_one(query)
        if row != None:
            return row[col]
        else:
            return None

    def fetch_columns(self, table):
        self.cursor.prepare("""select COLUMN_NAME from dba_tab_columns where table_name = :tablea""")
        self.cursor.execute(None, {'tablea':table})
        result = self.cursor.fetchall()

        return [i[0] for i in result]

    def get_table_columns(self, table):
        self.cursor.prepare("""select COLUMN_NAME, DATA_TYPE from dba_tab_columns where table_name = :tablea""")
        self.cursor.execute(None, {'tablea':table})
        result = self.cursor.fetchall()

        self.cursor.prepare("""select comments from all_tab_comments where table_name = :tablea""")
        self.cursor.execute(None, {'tablea':table})
        result_comm = self.cursor.fetchall()

        return result, result_comm


    def generate_query(self, table, schema=None, columns=None, filters=None, sort=None, limit=None, offset=None):

        sql_columns = '*'
        sql_from = ''
        sql_filter = ''
        sql_sort = ''
        sql_limit = ''

        if schema:
            sql_from = '%s.%s' %(schema, table)
        else:
            sql_from = table

        tbl_columns = self.fetch_columns(table)

        if columns:
            sql_columns = columns.join(', ')

        if filters:
            sql_filter = self.parseFilter(filters, checkColumns=tbl_columns)

        if sort:
            sql_sort = self.parseSort(sort, tbl_columns)

        if limit:
            sql_limit = self.parseLimit(limit, offset)

        sql = ("SELECT %s FROM %s %s %s %s;") % (sql_columns, sql_from, sql_filter, sql_sort, sql_limit)

        return sql


    def parseFilter(self, filter, dictionary = False, checkColumns = None):

        """
        Usado nos metodos que se comunicam com o Framework Extjs.
        Recebe um String no formato:
            [{"property":"<property_name>","value":<property_value>, "comparison":<comparison_operator>}]
        Converte a string em um dicionario faz um loop para cada propriedade
        retorna uma string no formato:
            comparison default "="
            apenas uma propriedade  = <property_name> <comparison> <property_value>
            mais de uma propriedade = <property_name> <comparison> <property_value> AND <property_name2> <comparison> <property_value2>
        ou um dict {<property_name>:<property_value>}
        Caso nao tenha a filter retorna None
        """
        if (filter is not None):
            sql_filters = str()
            sql_clauses = list()
            # try:
            if isinstance(filter, list):
                filters = filter
            elif (isinstance(filter, str)) or (isinstance(filter, unicode)):
                # Faz um parse da string Json para um dict
                filters = json.loads(filter)
            else:
                # tenta fazer o parse
                filters = json.loads(filter)

            dFilters = dict()

            for col in filters:
                noOperators = False
                comp = "="

                acceptProperty  = True
                # se tiver checkColumns verificar se a coluna esta na lista
                if isinstance(checkColumns, list):
                    if (col['property'] not in checkColumns):
                        # propriedade nao valida
                        acceptProperty = False


                if ('comparison' in col):
                    comp = col['comparison']

                elif ('operator' in col):

                    operators = ["<", "<=", "=", ">", ">=", "!=", "in", "like", "<>", "is", "is not"]
                    if (col['operator'] == 'gt' or col['operator'] == 'lt' or col['operator'] == 'eq'):
                        if col['operator'] == 'eq':
                          comp = "="
                        elif col['operator'] == 'lt':
                            comp = "<"
                        else:
                            comp = '>'
                        noOperators = True

                    elif (col['operator'].lower() in operators):
                        comp = col['operator']

                if ('comparison' in col):
                    comp = col['comparison']

                elif ('operator' in col):

                    operators = ["<", "<=", "=", ">", ">=", "!=", "in", "like", "<>", "is", "is not"]
                    if (col['operator'] == 'gt' or col['operator'] == 'lt' or col['operator'] == 'eq'):
                        if col['operator'] == 'eq':
                          comp = "="
                        elif col['operator'] == 'lt':
                            comp = "<"
                        else:
                            comp = '>'
                        noOperators = True

                    elif (col['operator'].lower() in operators):
                        comp = col['operator']

                if noOperators:
                    try:
                        import datetime
                        split = col['value'].split("/")
                        col['value'] = datetime.date(int(split[2]),int(split[0]), int(split[1]))
                    except Exception as error:
                        pprint("Exception: Parse Sort:")
                        pprint(error)
                    try:
                        import datetime
                        split = col['value'].split("-")
                        col['value'] = datetime.date(int(split[2]),int(split[0]), int(split[1]))
                    except Exception as error:
                        pprint("Exception: Parse Sort:")
                        pprint(error)
                    clause = " %s %s '%s'" %(col['property'], comp, col['value'])

                elif comp == 'is' or comp == 'is not':
                    clause = " %s %s %s" %(col['property'], comp, col['value'])
                # elif comp == 'like':
                #     clause = " %s %s '%s'" %(col['property'], comp, col['value'])

                elif comp.lower() == 'in':
                    clause = " %s %s (%s)" %(col['property'], comp, col['value'])
                    # TODO in o value pode ser uma string ou uma lista
                    # caso seja lista converter para string separada por ,
                    # IN(valor1, valor2)
                    # value='(valor1, valor2)'
                    # if is array : ", ".join(col['value']) = 'valor1,valor2' coloca '(string)'
                    #     pass
                elif comp == 'like':
                    clause = " " + col['property'] + " ILIKE" + " '%%" + "%s"%(col['value']) + "%%'"
                else:
                    clause = " %s %s '%s'" %(col['property'], comp, col['value'])

                if acceptProperty:
                    sql_clauses.append(clause)
                    dFilters.update({col['property']:col['value']})

            if len(sql_clauses) > 0:
                    sql_filters += " AND ".join(sql_clauses)
        else:
            return None

        if (dictionary == True):
            return dFilters
        else:
            if sql_filters:
                return sql_filters
            else:
                return None



    def parseSort(self, sorters, obj = False, checkColumns = None, consider_null = False):
        """
        Usado nos metodos que se comunicam com o Extjs.
        Recebe um String no formato:
            [{"property":"<property_name>","direction":<direction>}]
        Converte a string em um dicionario faz um loop para cada propriedade
        retorna uma string no formato:
            apenas uma propriedade  = ORDER BY <property_name> <direction>
            mais de uma propriedade = ORDER BY <property_name> <direction>, <property_name2> <direction2>
        se o parametro obj for True
            retorna uma lista de propriedades
                [{<property_name>:<direction>}]
        Caso nao consiga converter retorna retorna None

        """

        lSorters = list()
        rSorters = list()
        sSorters = list()

        if sorters is None:
            return None

        try:
            if isinstance(sorters, list):
                lSorters = sorters
                pass
            elif (isinstance(sorters, str)) or (isinstance(sorters, unicode)):
                # Faz um parse da string Json para um dict
                lSorters = json.loads(sorters)
            else:
                # tenta fazer o parse
                lSorters = json.loads(sorters)

            for sort in lSorters:

                acceptProperty = True
                # se tiver checkColumns verificar se a coluna esta na lista
                if isinstance(checkColumns, list):
                    if (sort['property'] not in checkColumns):
                        # propriedade nao valida
                        acceptProperty = False

                if acceptProperty:
                    clause = " %s %s " %(sort['property'], sort['direction'])
                    sSorters.append(clause)

                    dSort = dict({
                        sort['property']: sort['direction']
                    })
                    rSorters.append(dSort)

            if (obj is True):
                if len(rSorters) > 0:
                    return rSorters
                else:
                    return None
            else:
                if sSorters:
                    sql_sort = ", ".join(sSorters)

                    if consider_null == True:
                        sql_sorters = " ORDER BY (case when %s is null then 1 else 0 end), %s" %(sort['property'], sql_sort)
                        return sql_sorters
                    else:
                        sql_sorters = " ORDER BY %s " %(sql_sort)
                        return sql_sorters
                else:
                    return None

        except Exception as error:
            pprint("Exception: Parse Sort:")
            pprint(error)
            return None


    def parseLimit(self, limit, offset=None):
        """
        Usado nos metodos que se comunicam com o Extjs.
        Caso nao consiga converter retorna retorna None

        """
        sLimit = str()

        if limit is None:
            return None

        try:
            if (isinstance(limit, int)) and (limit > 0):
                sLimit = " LIMIT %s" %(limit)

                if (isinstance(offset, int)) and (offset > 0):
                    sLimit += " OFFSET %s" %(offset)

                return sLimit
            else:
                return None

        except Exception as error:
            pprint("Exception: Parse Limit:")
            pprint(error)
            return None
 

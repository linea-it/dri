import json
import math
import warnings

import sqlalchemy
from sqlalchemy import Column, cast, desc, func
from sqlalchemy import exc as sa_exc
from sqlalchemy.sql import and_, or_, select
from sqlalchemy.sql.expression import between, literal_column

from lib.sqlalchemy_wrapper import DBBase


class MapDB(DBBase):
    def __init__(self, db='catalog'):
        if db is None or db == "":
            db = 'catalog'

        super(MapDB, self).__init__(db)


class MapTable(MapDB):
    def __init__(self, table, schema=None, database=None):
        super(MapTable, self).__init__(db=database)

        self.log.info("------------ TESTE MAP --------------------")

        self.schema = schema
        if schema is None or schema is "":
            self.schema = None

        # Lista de Colunas obrigatórias para que está classe funcione corretamente.
        self.mandatory_columns = list(['pixel', 'signal', 'teste'])

        # columns = lista de instancias SqlAlchemy::Column() com todas as colunas da tabela
        self.columns = list()

        # column_name = Lista de string com os nomes de todas as colunas da tabela utilziada para checar se uma
        # determinada coluna existe na tabela.
        self.column_names = list()

        # Verificar se a Tabela Existe
        if not self.table_exists(table, schema=self.schema):
            raise Exception("Table or view  %s.%s does not exist" % (self.schema, table))

        # Criar os Metadata da Tabela para o SqlAlchemy

        # Desabilitar os warnings na criacao da tabela
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=sa_exc.SAWarning)

            self.table = self.get_table_obj(table, schema=self.schema)

            # Nome das colunas originais na tabela
            for column in self.table.columns:
                column_name = column.key.strip().lower()

                self.columns.append(Column(column_name))
                self.column_names.append(column_name)

        # Verifica se o tabela possui as colunas que são obrigatórias para esta classe.
        for col in self.mandatory_columns:
            if col not in self.column_names:
                raise Exception("This %s table does not have the %s attribute which is mandatory." % (table, col))

    def max_signal(self):
        """Returns the maximum signal value

        Returns:
            float: Maximum value for signal attribute
        """

        tbl = self.table

        stm = select([func.max(tbl.c.signal)])

        value = self.fetch_scalar(stm)

        return value

    def min_signal(self):
        """Returns the minimun signal value

        Returns:
            float: Minimun value for signal attribute
        """
        tbl = self.table

        stm = select([func.min(tbl.c.signal)])

        value = self.fetch_scalar(stm)

        return value

    def signal_by_healpix(self, healpix):
        """Returns the signal value for a specific healpix.

        Args:
            healpix (int): Healpix id

        Returns:
            float: Signal value for the pixel.
        """
        tbl = self.table

        stm = select([tbl.c.signal]).where(and_(tbl.c.pixel == int(healpix)))

        value = self.fetch_scalar(stm)

        return value

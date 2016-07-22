from django.db import connections
from collections import namedtuple

from lib.OracleWrapper import OracleWrapper
from lib.SqliteWrapper import SqliteWrapper

class CatalogDB:
    available_engines = list(['sqlite3', 'oracle'])
    db = None
    engine = None
    cursor = None
    wrapper = None

    def __init__(self, db='catalog'):
        self.setDb(db)

        self.setWrapper()

    def setDb(self, db):
        if db != 'default':
            # Tenta conectar ao banco de dados se conseguir retorna o cursor.
            self.cursor = connections[db].cursor()

            # Recupera a engine a ser usada no banco de dados
            self.engine = self.__getDbEngine()

            #  So seta o banco se tiver conseguido criar o cursor e recuperado a engine.
            self.db = db

        else:
            raise Exception('The database default can not be used as a catalog database.')

    def setWrapper(self):
        # cria uma intancia da classe wrapper a ser usada de acordo com o banco de dados
        engine = self.engine

        if engine == 'sqlite3':
            self.wrapper = SqliteWrapper(self.cursor)

        elif engine == 'oracle':
            self.wrapper = OracleWrapper(self.cursor)



    def __getDbEngine(self):
        # Recuperar no dict settings DATABASE a configuracao do banco de dados atual
        complete_engine = self.cursor.db.settings_dict.get('ENGINE')

        # a string comple e esta django.db.backends.sqlite3 com o split usamos so a ultima parte sqlite3
        engine = complete_engine.split('.').pop()

        # checar se a engine esta na lista de engines suportadas como banco de catalogos
        if engine in self.available_engines:
            return engine
        else:
            raise Exception("The engine %s is not available to be used as database for catalogs."
                            "The available engines are these: %s" % (engine, ', '.join(self.available_engines)))






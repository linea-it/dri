from lib.sqlalchemy_wrapper import DBBase,DBDRIHelper

class CatalogDB:
    def __init__(self, db='catalog'):
        self.database = DBBase(DBDRIHelper.prepare_connection(db))

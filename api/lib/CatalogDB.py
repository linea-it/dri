from lib.sqlalchemy_wrapper import DBBase


class CatalogDB:
    def __init__(self, db='catalog'):
        conn_parameters = DBBase.prepare_connection(db)
        self.database = DBBase(conn_parameters)

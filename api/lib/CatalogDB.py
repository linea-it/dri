from django.conf import settings
from lib.sqlalchemy_wrapper import DBBase


class CatalogDB:
    def __init__(self, db='catalog'):
        self.database = DBBase(self.prepare_connection(db))

    def prepare_connection(self, db):
        connection_data = {}

        if db not in settings.DATABASES:
            raise Exception('This configuration does not exist.')

        db_settings_django = settings.DATABASES[db]
        connection_data['ENGINE'] = db_settings_django['ENGINE'].split('.')[-1]

        if connection_data['ENGINE'] == 'sqlite3':
            connection_data['PATH_FILE'] = db_settings_django['NAME']

        elif connection_data['ENGINE'] == 'oracle':
            aux = db_settings_django['NAME'].split('/')
            connection_data['DATABASE'] = aux[1]

            aux = aux[0].split(':')
            connection_data['HOST'] = aux[0]
            connection_data['PORT'] = aux[1]
            connection_data['USER'] = db_settings_django['USER']
            connection_data['PASSWORD'] = db_settings_django['PASSWORD']

        else:
            raise Exception('Unknown database')

        return connection_data

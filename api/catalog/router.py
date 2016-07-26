class CatalogRouter(object):
    """
        A router to control all database operations on models in the
        catalog application.
        """

    def db_for_read(self, model, **hints):
        """
        Attempts to read catalog models go to catalog db.
        """
        if model._meta.app_label == 'catalog':
            return 'catalog'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write catalog models go to catalog.
        """
        if model._meta.app_label == 'catalog':
            return 'catalog'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the catalog app is involved.
        """
        if obj1._meta.app_label == 'catalog' or \
                        obj2._meta.app_label == 'catalog':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the catalog app only appears in the 'catalog'
        database.
        Determine if the migration operation is allowed to run on the database with alias db.
        Return True if the operation should run, False if it shouldnt run, or None if the router has no opinion.
        """
        if db == 'catalog':
            if app_label == 'catalog':
                return True
            else:
                return False
        else:
            if app_label == 'catalog':
                return False
            else:
                return True

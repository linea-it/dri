import logging

from activity_statistic.models import Activity
from django.conf import settings
from django.contrib.auth.models import User, Group
from lib.sqlalchemy_wrapper import DBBase


class NcsaBackend(object):
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger('ncsa_authentication')

    # this method is needed by Django auth backend
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def authenticate(self, username=None, password=None):
        self.logger.info("Try NCSA Authentication")
        if self.check_user(username, password):
            user = self.ensure_user(username)

            self.logger.info("Login successfully completed")
            return user

        else:
            self.logger.info("Login failedd")
            return None

    def get_database_name(self):
        try:
            return settings.NCSA_AUTHENTICATION_DB

        except:
            raise Exception("configuration variable \"NCSA_AUTHENTICATION_DB\" was unset in local_vars")

    def get_des_user_tablename(self):
        try:
            return settings.NCSA_AUTHENTICATION_USERS_TABLE

        except:
            raise Exception("configuration variable \"NCSA_AUTHENTICATION_USERS_TABLE\" was unset in local_vars")

    def check_user(self, username, password):
        try:
            dbname = self.get_database_name()

            self.logger.info("Verify that the user has access to the [%s] Database" % dbname)

            self.logger.info("Username: %s" % username)

            self.logger.debug("Password: %s" % password)

            DBBase(dbname, [username, password])
            # [CMP] this should be not needed,
            # if a pool is used it will close all the connection of the pool
            # db.engine.dispose()

            self.logger.info("[%s] User has access to the Database" % username)

            return True

        except:
            self.logger.warning("[%s] This user does NOT HAVE access to the [%s] database" % (username, dbname))

            return False

    def ensure_user(self, username):
        self.logger.info("Verifying that the user [%s] already exists in the administrative database" % username)

        try:

            user = User.objects.get(username=username)

            self.logger.info("User already registered.")

        except User.DoesNotExist:
            user = User(username=username)

            self.logger.info("User not registered, first access.")

        # update NCSA user info
        user_info = self.getUserInfo(username)
        user.email = user_info['email']
        user.first_name = user_info['firstname']
        user.last_name = user_info['lastname']
        user.save()

        self.logger.info("Updated user data")

        Activity(owner=user, event="new_user_ncsa").save()
        # TODO [CMP] the group NCSA should be better defined
        # NOTE it appears to be the origin of the created user
        # we should define where (if) we will use this information
        group = self.ensure_group('NCSA')
        user.groups.add(group)

        return user

    def getUserInfo(self, username):
        # TODO [CMP] this should have a connection management/pool
        dbname = self.get_database_name()

        self.logger.info("Retrieve the user's cadastral data in the [%s] database" % dbname)

        db = DBBase(dbname)

        des_user_table = self.get_des_user_tablename()

        sql = "SELECT email, firstname, lastname FROM %s WHERE username = '%s'" % (des_user_table.upper(), username)

        self.logger.debug("SQL: %s" % sql)

        user = db.fetchone_dict(sql)

        self.logger.debug(user)

        return user

    def ensure_group(self, name):
        try:
            group = Group.objects.get(name=name)
        except Group.DoesNotExist:
            group = Group(name=name)
            group.save()

        return group

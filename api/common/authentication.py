from django.contrib.auth.models import User, Group
from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy.sql import select
from sqlalchemy.sql import table
from sqlalchemy.sql import column


class NcsaBackend(object):

    # this method is needed by Django auth backend
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def authenticate(self, username=None, password=None):
        if self.check_user(username, password):
            return self.ensure_user(username)

        return None

    def check_user(self, username, password):
        try:
            prep = DBBase.prepare_connection('dessci')
            prep['USER'] = username
            prep['PASSWORD'] = password
            db = DBBase(prep)
            # [CMP] this should be not needed,
            # if a pool is used it will close all the connection of the pool
            # db.engine.dispose()

            return True

        except Exception:
            return False

    def ensure_user(self, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User(username=username)

        # update NCSA user info
        user_info = self.getUserInfo(username)
        user.email = user_info['email']
        user.first_name = user_info['firstname']
        user.last_name = user_info['lastname']
        user.save()

        # TODO [CMP] the group NCSA should be better defined
        # NOTE it appears to be the origin of the created user
        # we should define where (if) we will use this information
        group = self.ensure_group('NCSA')
        user.groups.add(group)

        return user

    def getUserInfo(self, username):
        # TODO [CMP] this should have a connection management/pool
        db = DBBase(DBBase.prepare_connection('dessci'))
        stm = select([column('email'), column('firstname'), column('lastname')]).select_from(
            table('des_users')).where(column('username') == username)
        return db.fetchone_dict(stm)

    def ensure_group(self, name):
        try:
            group = Group.objects.get(name=name)
        except Group.DoesNotExist:
            group = Group(name=name)
            group.save()

        return group

from django.contrib.auth.models import User, Group
from rest_framework import authentication
from rest_framework import exceptions
# import cx_Oracle
from django.conf import settings

class NcsaBackend(object):

    def authenticate(self, username=None, password=None):

        if self.check_user(username, password):
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:

                group = self.get_group('NCSA')

                user = User(username=username)
                user.save()
                user.groups.add(group)

            return user

        return None


    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


    def check_user(self, username, password):

        db = settings.DATABASES.get('dessci')
        # host, name = db.get('NAME').split('/')
        # host, port = host.split(':')

        kwargs = {
            # 'host': host,
            # 'port': port,
            # 'service_name': name
        }
        # dsn = cx_Oracle.makedsn(**kwargs)
        try:
            dbh = cx_Oracle.connect(username, password, dsn=dsn)
            dbh.close()
            return True

        except Exception as e:
            return False

    def get_group(self, name):

        try:
            group = Group.objects.get(name=name)

        except Group.DoesNotExist:
            group = Group(name=name)
            group.save()

        return group
from django.contrib.auth.models import User, Group
from sqlalchemy import create_engine
from django.conf import settings


class NcsaBackend(object):
    def updateEmail(self, username):
        db = settings.DATABASES.get('dessci')
        host, name = db.get('NAME').split('/')
        host, port = host.split(':')

        portalusername = db.get('USER')
        portalpass = db.get('PASSWORD')

        url = (
            "oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
            "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
            "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
            "SERVICE_NAME=%(database)s)))"
        ) % {
            "username": portalusername, "password": portalpass,
            "host": host, "port": port,
            "database": name
        }
        engine = create_engine(url)
        connection = engine.connect()

        rs = connection.execute(
            "SELECT email, firstname, lastname" +
            " FROM des_users where username = '" + username + "'"
        )
        row = rs.fetchone()
        email = row[0]
        first_name = row[1]
        last_name = row[2]
        connection.close()

        return (email, first_name, last_name)

    def authenticate(self, username=None, password=None):

        if self.check_user(username, password):
            try:
                user = User.objects.get(username=username)
                email, first_name, last_name = self.updateEmail(username)
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                user.save()
            except User.DoesNotExist:
                group = self.get_group('NCSA')
                user = User(username=username)
                email, first_name, last_name = self.updateEmail(username)
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
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

        try:
            db = settings.DATABASES.get('dessci')
            host, name = db.get('NAME').split('/')
            host, port = host.split(':')

            url = (
                "oracle://%(username)s:%(password)s@(DESCRIPTION=(" +
                "ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=%(host)s)(" +
                "PORT=%(port)s)))(CONNECT_DATA=(SERVER=dedicated)(" +
                "SERVICE_NAME=%(database)s)))"
            ) % {
                "username": username, "password": password,
                "host": host, "port": port,
                "database": name
            }
            engine = create_engine(url)
            connection = engine.connect()
            connection.close()

            return True

        except Exception:
            return False

    def get_group(self, name):

        try:
            group = Group.objects.get(name=name)

        except Group.DoesNotExist:
            group = Group(name=name)
            group.save()

        return group

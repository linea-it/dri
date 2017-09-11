import os
from django.core.wsgi import get_wsgi_application
from django.contrib.auth.handlers.modwsgi import check_password

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dri.settings")

application = get_wsgi_application()

from rest_framework.authtoken.models import Token

def check_password(environ, user, password):
    try:
        Token.objects.get(key=environ['HTTP_TOKEN'])
        return True
    except:
        return False

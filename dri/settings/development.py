# Load defaults in order to then add/override with development-only settings
from dri.settings.defaults import *

DEBUG = True

CORS_ORIGIN_ALLOW_ALL = True

INSTALLED_APPS.extend([
    'debug_toolbar',
])

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'driapi_development.db',
    }
}
# Exemple using Mysql need mysqlclient in requiments.txt
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'dri',
#         'USER': 'driapi',
#         'PASSWORD': 'driapi',
#         'HOST': 'localhost',
#         'PORT': ''
#     }
# }

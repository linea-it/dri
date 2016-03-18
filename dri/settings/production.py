# Load defaults in order to then add/override with production-only settings
#
# To use this file is necessary to set the variable environment DJANGO_SETTINGS_MODULE with dri.settings.production value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.production

from dri.settings.defaults import *

DEBUG = False

ALLOWED_HOSTS = [
    '10.0.10.30',
    'devel3.linea.gov.br',
    'devel3',
    '200.156.254.10',
    '127.0.0.1', 'localhost',
]

CORS_ORIGIN_ALLOW_ALL = True

# CORS_ORIGIN_WHITELIST = (
#     # 'hostname.example.com'
# )

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'driapi_production.db',
    }
}

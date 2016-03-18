# Load defaults in order to then add/override with testing-only settings

# To use this file is necessary to set the variable environment DJANGO_SETTINGS_MODULE with dri.settings.testing value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.testing

from dri.settings.defaults import *

DEBUG = True

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

ALLOWED_HOSTS = [
    '10.0.10.30',
    'devel3.linea.gov.br',
    'devel3',
    '200.156.254.10',
    '127.0.0.1', 'localhost',
]

CORS_ORIGIN_ALLOW_ALL = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'driapi_testing.db',
    }
}

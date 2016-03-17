# Load defaults in order to then add/override with testing-only settings

# To use this file is necessary to set the variable environment DJANGO_SETTINGS_MODULE with dri.settings.testing value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.testing

from dri.settings.defaults import *

DEBUG = True

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

CORS_ORIGIN_ALLOW_ALL = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'driapi',
    }
}

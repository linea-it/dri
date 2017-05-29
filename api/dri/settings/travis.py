from dri.settings.defaults import *

import os

print("Using Settings Travis")

BASE_PROJECT = os.environ.get("TRAVIS_BUILD_DIR")
print("BaseProject %s" % BASE_PROJECT)

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_PROJECT, 'db/dri.db'),
    },
    'catalog': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_PROJECT, 'db/catalog.db'),
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_PROJECT, 'log/test.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

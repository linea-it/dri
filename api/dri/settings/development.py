# Load defaults and local_vars in order to then add/override with development-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

import os

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = True

# INSTALLED_APPS.extend([
#     'debug_toolbar',
# ])

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(asctime)s [%(levelname)s] %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'django.log'),
        },
        'descutoutservice': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'cutout.log'),
            'formatter': 'simple'
        },
        'downloads': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'downloads.log'),
            'formatter': 'simple'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'descutoutservice': {
            'handlers': ['descutoutservice'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'downloads': {
            'handlers': ['downloads'],
            'level': 'DEBUG',
            'propagate': True,
        },
    }
}
# Load defaults and local_vars in order to then add/override with development-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

import os

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%m/%y %H:%M:%S"
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'django': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'django.log'),
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['django'],
            'propagate': True,
            'level': 'DEBUG',
        },
    }
}

# INSTALLED_APPS.extend([
#     'debug_toolbar',
# ])

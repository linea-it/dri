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
        'NAME': os.path.join(BASE_DIR, 'driapi_development.db'),
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

LOG_DIR = ''
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
        'coadd': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'coadd.log'),
            'formatter': 'verbose'
        },
        'product_classifier': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'product_classifier.log'),
            'formatter': 'verbose'
        },
        'product_register': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'product_register.log'),
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['django'],
            'propagate': True,
            'level': 'DEBUG',
        },
        'coadd': {
            'handlers': ['coadd'],
            'level': 'DEBUG',
        },
        'product_classifier': {
            'handlers': ['product_classifier'],
            'level': 'DEBUG',
        },
        'product_register': {
            'handlers': ['product_register'],
            'level': 'DEBUG',
        },
    }
}

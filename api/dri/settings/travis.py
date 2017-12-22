from dri.settings.defaults import *

import os

print("Using Settings Travis")

BASE_PROJECT = os.environ.get("TRAVIS_BUILD_DIR")
print("BaseProject %s" % BASE_PROJECT)

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = True

LOG_DIR = os.path.join(BASE_PROJECT, 'log')

DATA_DIR = os.path.join(BASE_PROJECT, 'data')

DOWNLOAD_DIR = os.path.join(DATA_DIR, 'download')

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

EMAIL_HELPDESK = 'helpdesk@linea.gov.br'
EMAIL_HOST = 'smtp.linea.gov.br'
EMAIL_PORT = '<porta do smtp>'
EMAIL_HOST_USER = '<usuario que vai ser usado no smtp>'
EMAIL_HOST_PASSWORD = '<senha do smtp>'
EMAIL_USE_TLS = True

DES_CUTOUT_SERVICE = {
    'HOST': 'http://descut.cosmology.illinois.edu',
    'USER': None,
    'PASSWORD': None,
    'CUTOUT_DIR': 'targets/cutouts',
    'CUTOUT_SOURCE': '/data',
    'CUTOUT_TASK_CHECK_JOBS_DELAY': 1,
    'AVAILABLE_RELEASES': None,
    'MAX_OBJECTS': 300
}

NCSA_AUTHENTICATION_DB = None
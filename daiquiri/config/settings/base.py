import os

from . import ADDITIONAL_APPS, BASE_DIR, DJANGO_APPS

SITE_IDENTIFIER = 'localhost'
SITE_TITLE = 'localhost'
SITE_DESCRIPTION = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'
SITE_LICENSE = 'CC0'
SITE_CREATOR = 'Anna Admin'
SITE_CONTACT = {
    'name': 'Anna Admin',
    'address': 'Example Road 1',
    'email': 'admin@example.com',
    'telephone': '+01 234 56789'
}
SITE_PUBLISHER = 'At vero eos et accusam'
SITE_CREATED = '2019-01-01'
SITE_UPDATED = '2019-04-01'

INSTALLED_APPS = DJANGO_APPS + [
    'daiquiri.archive',
    'daiquiri.auth',
    'daiquiri.conesearch',
    'daiquiri.contact',
    'daiquiri.core',
    'daiquiri.files',
    'daiquiri.jobs',
    'daiquiri.meetings',
    'daiquiri.metadata',
    'daiquiri.oai',
    'daiquiri.query',
    'daiquiri.registry',
    'daiquiri.serve',
    'daiquiri.stats',
    'daiquiri.tap',
    'daiquiri.uws',
    'daiquiri.wordpress',
] + ADDITIONAL_APPS

QUERY_DROPDOWNS = [
    {
        'key': 'simbad',
        'service': 'query/js/dropdowns/simbad.js',
        'template': 'query/query_dropdown_simbad.html',
        'options': {
            'url': 'http://simbad.u-strasbg.fr/simbad/sim-id'
        }
    },
    {
        'key': 'vizier',
        'service': 'query/js/dropdowns/vizier.js',
        'template': 'query/query_dropdown_vizier.html',
        'options': {
            'url': 'http://vizier.u-strasbg.fr/viz-bin/votable',
            'catalogs': ['I/322A', 'I/259', 'II/281', 'II/246', 'V/139', 'V/147', 'I/317', 'II/328/allwise']
        }
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'daiquiri_app',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
    },
    'data': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'daiquiri_data',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
    },
    'tap': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'daiquiri_data',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
    },
    'oai': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'daiquiri_data',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
    },
    # 'cutout_xxx': {
    #     'ENGINE': 'django.db.backends.postgresql',
    #     'NAME': 'xxx',
    #     'USER': 'postgres',
    #     'PASSWORD': 'postgres',
    #     'HOST': 'database',
    #     'PORT': 5432,
    # },
}


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_URL = '/daiquiri_static/'

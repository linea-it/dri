from dri.settings.defaults import *

import os

print("Using Settings Travis")

BASE_PROJECT = os.environ.get("TRAVIS_BUILD_DIR", "/app/")
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
    # 1 para a versao do Descut Colaboracao 2 para versao Descut Public
    'API_VERSION': 1,
    'HOST': 'https://descut.cosmology.illinois.edu',
    'USER': None,
    'PASSWORD': None,
    # Path onde ficaram os arquivos de cutout, esse parametro sera usado em conjunto com DATA_DIR para criar o path
    # absoluto para os arquivos.
    'CUTOUT_DIR': 'targets/cutouts',
    # Url base que sera usada para exibir as imagens geradas esse parametro deve ser mapeado no dri.conf no apache
    'CUTOUT_SOURCE': '/data',
    # Tempo de delay para a task check_jobs em minutos
    'CUTOUT_TASK_CHECK_JOBS_DELAY': 1,
    # Lista dos Releases que podem ser usados para cutout em lowercase. use [] para permitir todos
    'AVAILABLE_RELEASES': [],
    # Quantidade limit de objetos a ser passada para o descutout
    'MAX_OBJECTS': 300,
    # Token de authenticacao utilizado apenas para o DescutPublico para colaboracao usar None
    'TOKEN': None,
    # Esta opcao deve ser False para o DescutPublico e True para Colaboracao
    'DELETE_JOB_AFTER_DOWNLOAD': True,
    # Url para gerar o token, para o publico usar None.
    'API_GET_TOKEN': '/api/token/',
    # Url para a API reponsavel por criar os jobs
    'API_CREATE_JOBS': '/api/jobs/',
    # Url para a API responsavel por retornar o status dos jobs
    'API_CHECK_JOBS': '/api/jobs/',
    # No DescutPublico e necessario passar um email para onde seram enviadas as notificacoes do descut.
    'EMAIL': 'glauber.costa@linea.gov.br'
}

NCSA_AUTHENTICATION_DB = None


# LDAP Authentication
# Responsible for turn on and off the LDAP authentication:
AUTH_LDAP_ENABLED = False

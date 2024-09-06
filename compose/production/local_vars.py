import os

# Identification of the environment
ENVIRONMENT_NAME = "Production"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# A list of strings representing the host/domain names that this Django site can serve.
ALLOWED_HOSTS = ['*']

# Exemplo de Database utilizando a imagem docker do postgresql
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get("DATABASE_ADMIN_DB"),
        'USER': os.environ.get("DATABASE_ADMIN_USER"),
        'PASSWORD': os.environ.get("DATABASE_ADMIN_PASSWORD"),
        'HOST': os.environ.get("DATABASE_ADMIN_HOST", "desdb4.linea.org.br"),
        'PORT': os.environ.get("DATABASE_ADMIN_PORT", 5432),
        'OPTIONS': {
            'options': '-c search_path=dri_admin,public'
        }
    },
    'catalog': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get("DATABASE_ADMIN_DB"),
        'USER': os.environ.get("DATABASE_ADMIN_USER"),
        'PASSWORD': os.environ.get("DATABASE_ADMIN_PASSWORD"),
        'HOST': os.environ.get("DATABASE_ADMIN_HOST", "desdb4.linea.org.br"),
        'PORT': os.environ.get("DATABASE_ADMIN_PORT", 5432),
        'OPTIONS': {
            'options': '-c search_path=dri_catalog,public'
        },
    },
    'prod_gavo': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get("DATABASE_CATALOG_DB", "prod_gavo"),
        'USER': os.environ.get("DATABASE_CATALOG_USER"),
        'PASSWORD': os.environ.get("DATABASE_CATALOG_PASSWORD"),
        'HOST': os.environ.get("DATABASE_CATALOG_PASSWORD", "desdb4.linea.org.br"),
        'PORT': os.environ.get("DATABASE_CATALOG_PORT", 5432),
    },
    'mydb': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get("DATABASE_MYDB_DB"),
        'USER': os.environ.get("DATABASE_MYDB_USER"),
        'PASSWORD': os.environ.get("DATABASE_MYDB_PASSWORD"),
        'HOST': os.environ.get("DATABASE_MYDB_HOST", "desdb4.linea.org.br"),
        'PORT': os.environ.get("DATABASE_MYDB_PORT", 5432),
    },
}

# Email Notification configs
# Dados de configuração do servidor de email que será usado para envio das notificações.
EMAIL_HOST = 'mx4.linea.org.br'
EMAIL_PORT = '25'
EMAIL_HOST_USER = None
EMAIL_HOST_PASSWORD = None
EMAIL_USE_TLS = True
# Email utilizado para enviar as notificacoes do science server
EMAIL_NOTIFICATION = 'scienceserver.linea.org.br'
# Lista de email que receberão uma copia de todas as notificacoes
EMAIL_NOTIFICATION_COPY_TO = list(['dri-portal-notify@linea.org.br'])
# Email para o helpdesk LIneA
EMAIL_HELPDESK = 'helpdesk@linea.org.br'
# Email de contato do LIneA
EMAIL_HELPDESK_CONTACT = 'helpdesk@linea.org.br'
# Email que recebera as notificacoes e relatorios gerados pelo science server
EMAIL_ADMIN = 'dri@linea.org.br'
# Enables or disables sending daily email access statistics.
SEND_DAILY_STATISTICS_EMAIL = True 


# Configs das Aplicações:
# TARGET VIEWER:
# Lista de databases que o Target viewer pode acessar, deve ser o mesmo onde as tabelas rating e reject foram criada.
# As vezes é necessário ter o mesmo banco de dados com 2 configurações, como acontece com o catalog e dessci no NCSA.
# nesse caso o usuario só conhece o dessci
# este campo deveria ser preenchido com o valor dessci.
TARGET_VIEWER_DATABASES = ['mydb', 'catalog', 'prod_gavo']

# Tempo limite em horas para que um produto fique disponivel, apos este tempo
# o produto sera removido pelo garbage colector e sua tabela sera dropada. Use None para desabilitar.
PRODUCT_EXPIRATION_TIME = None

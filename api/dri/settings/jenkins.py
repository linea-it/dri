import os
print("Using Settings Jenkings")

ALLOWED_HOSTS = '*'

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join('/archive', 'dri.db'),
    },
    'catalog': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join('/archive', 'catalog.db'),
    }
}

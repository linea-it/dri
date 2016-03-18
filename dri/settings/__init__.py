# Simple Package Organization for Environments
# https://code.djangoproject.com/wiki/SplitSettings

# Importa por default os settings de development caso nao haja variavel de ambiente setada
# o valor dri.setting e default e esta setado em wsgi.py

import os

modules = os.environ.get('DJANGO_SETTINGS_MODULE', None)
if modules == 'dri.settings':
    from dri.settings.development import *

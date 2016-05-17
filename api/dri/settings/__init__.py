# Simple Package Organization for Environments
# https://code.djangoproject.com/wiki/SplitSettings

# Importa por default os settings de development caso nao haja arquivo de local.py
try:
    from dri.settings.local import *
except:
    from dri.settings.development import *
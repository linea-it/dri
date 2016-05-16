# Load defaults in order to then add/override with production-only settings
#
# To use this file is necessary to set the environment variable
# DJANGO_SETTINGS_MODULE with dri.settings.testing value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.production

from dri.settings.defaults import *

DEBUG = False
CORS_ORIGIN_ALLOW_ALL = False
CORS_ALLOW_CREDENTIALS = True
# CORS_ORIGIN_WHITELIST = (         # [CMP] to enable in setting/local.py
#     # 'hostname.example.com'
# )

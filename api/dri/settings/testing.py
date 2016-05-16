# Load defaults in order to then add/override with testing-only settings
#
# To use this file is necessary to set the environment variable
# DJANGO_SETTINGS_MODULE with dri.settings.testing value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.testing

from dri.settings.defaults import *

DEBUG = True
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = False

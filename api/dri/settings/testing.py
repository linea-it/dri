# Load defaults and local_vars in order to then add/override with testing-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

DEBUG = True
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = False

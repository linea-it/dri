# Load defaults and local_vars in order to then add/override with production-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

DEBUG = False
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
# CORS_ORIGIN_WHITELIST = (         # [CMP] to enable in setting/local.py
#     # 'hostname.example.com'
# )

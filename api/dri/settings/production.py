# Load defaults and local_vars in order to then add/override with production-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

import os

# Identification of the environment, leave empty for production
ENVIRONMENT_NAME = ""

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = False

# Enables or disables sending daily email access statistics.
SEND_DAILY_STATISTICS_EMAIL = True


# Including LDAP authentication:
if AUTH_LDAP_ENABLED:
  AUTHENTICATION_BACKENDS += ('django_auth_ldap.backend.LDAPBackend',)
# Load defaults and local_vars in order to then add/override with development-only settings
from dri.settings.defaults import *
from dri.settings.local_vars import *

import os

# Identification of the environment
ENVIRONMENT_NAME = "Testing"

ALLOWED_HOSTS = '*'
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_ALLOW_ALL = True

DEBUG = True

# Enables or disables sending daily email access statistics.
SEND_DAILY_STATISTICS_EMAIL = False
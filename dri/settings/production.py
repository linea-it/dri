# Load defaults in order to then add/override with production-only settings
#
# To use this file is necessary to set the variable environment DJANGO_SETTINGS_MODULE with dri.settings.production value.
# with activated virtualenv use the command
# export DJANGO_SETTINGS_MODULE=dri.settings.production

DEBUG = False

ALLOWED_HOSTS = []

CORS_ORIGIN_WHITELIST = (
    # 'hostname.example.com'
)

# TODO em production Static root pode ser um diretorio no apache
# STATIC_ROOT = os.path.join(BASE_DIR, 'static')

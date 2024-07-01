import os
# Logs

# Log Levels
# This log level describes the severity of the messages that the logger will handle. Python defines the following log levels:
# - DEBUG: Low level system information for debugging purposes
# - INFO: General system information
# - WARNING: Information describing a minor problem that has occurred.
# - ERROR: Information describing a major problem that has occurred.
# - CRITICAL: Information describing a critical problem that has occurred.
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

# Log Directory: Fixo por estar dentro do container
LOG_DIR = "/log"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "standard": {"format": "%(asctime)s [%(levelname)s] %(message)s"},
    },
    "handlers": {
        "default": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "django.log"),
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "formatter": "standard",
        },
        "db_handler": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "django_db.log"),
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "formatter": "standard",
        },
        # DRI APPS Logs
        "catalog_db": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "catalog_db.log"),
            "formatter": "standard",
        },
        "descutoutservice": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "cutout.log"),
            "formatter": "standard",
        },
        "downloads": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "downloads.log"),
            "formatter": "standard",
        },
        "import_process": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "import_process.log"),
            "formatter": "standard",
        },
        "product_export": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "product_export.log"),
            "formatter": "standard",
        },
        "import_target_csv": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "import_target_csv.log"),
            "formatter": "standard",
        },
        "product_saveas": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "product_saveas.log"),
            "formatter": "standard",
        },
        "ncsa_authentication": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "ncsa_authentication.log"),
            "formatter": "standard",
        },
        "garbage_colector": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "garbage_colector.log"),
            "formatter": "standard",
        },
        "send_email": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "send_email.log"),
            "formatter": "standard",
        },
        "djangosaml2": {
            "level": LOG_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "djangosaml2.log"),
            "formatter": "standard",
        },
    },
    "loggers": {
        "django": {"handlers": ["default"], "level": LOG_LEVEL, "propagate": True},
        "django.db.backends": {
            "handlers": ["db_handler"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # DRI APPS Logs
        "catalog_db": {
            "handlers": ["catalog_db"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "descutoutservice": {
            "handlers": ["descutoutservice"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "downloads": {
            "handlers": ["downloads"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "import_process": {
            "handlers": ["import_process"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "product_export": {
            "handlers": ["product_export"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "import_target_csv": {
            "handlers": ["import_target_csv"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "product_saveas": {
            "handlers": ["product_saveas"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "ncsa_authentication": {
            "handlers": ["ncsa_authentication"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "garbage_colector": {
            "handlers": ["garbage_colector"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "send_email": {
            "handlers": ["send_email"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "djangosaml2": {
            "handlers": ["djangosaml2"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
}
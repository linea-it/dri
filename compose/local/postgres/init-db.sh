#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA dri_admin;
    ALTER SCHEMA dri_admin OWNER TO $POSTGRES_USER;
    CREATE SCHEMA dri_catalog;
    ALTER SCHEMA dri_catalog OWNER TO $POSTGRES_USER;
EOSQL

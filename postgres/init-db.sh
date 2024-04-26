#!/bin/bash
set -e

# Create Schema for DRI Admin
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA dri_admin;
    ALTER SCHEMA dri_admin OWNER TO $POSTGRES_USER;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA dri_catalog;
    ALTER SCHEMA dri_catalog OWNER TO postgres;
EOSQL

# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     CREATE EXTENSION q3c;
#     SELECT q3c_version();
# EOSQL


# # Create Table DR2 SAMPLE SCHEMA
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     \i /data/des_dr2_sample.sql;
# EOSQL
# # -- CREATE INDEX coadd_objects_ra_dec ON des_dr2.coadd_objects USING btree (q3c_ang2ipix(ra, "dec"));

# # Create Table GAIA SAMPLE SCHEMA
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     \i /data/gaia_dr2_sample.sql;
# EOSQL

#!/bin/bash

echo "Running Migrate to apply changes in Admin database"
python3 manage.py migrate

echo "Running Migrate to apply changes in Catalog database"
python3 manage.py migrate catalog --database=catalog

echo "Running Collect Statics"
python manage.py collectstatic --clear --noinput --verbosity 0


echo "Running Django with uWSGI"
# Para producao usar uWSGI para servir o app e ter compatibilidade com Shibboleth
# https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
uwsgi \
  --socket 0.0.0.0:8000 \
  --http-socket 0.0.0.0:8001 \
  --wsgi-file /app/dri/wsgi.py \
  --py-autoreload 1 \
  --static-map /django_static/rest_framework/=/app/dri/django_static/rest_framework \
  --static-map /django_static/admin/=/app/dri/django_static/admin \
  --buffer-size=32768 \
  --processes=4 \
  --threads=2 



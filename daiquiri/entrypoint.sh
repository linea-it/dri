#!/bin/bash

# useradd -m -d /srv/daiquiri -c "Daiquiri user" -s /bin/bash daiquiri

python3 manage.py sqlcreate

python3 manage.py migrate

python3 manage.py migrate --database tap   # initializes the tap schema in the scientific db
python3 manage.py migrate --database oai   # initializes the oai schema in the scientific db
python3 manage.py download_vendor_files    # dowloads front-end files from the CDN


python3 manage.py collectstatic --clear --noinput --verbosity 0

# Start Celery Workers
celery worker --workdir /daiquiri_app --app daiquiri -l info &> /log/celery.log  &

# Start Celery Beat
celery worker --workdir /daiquiri_app --app daiquiri -l info --beat &> /log/celery_beat.log  &

# python3 manage.py runserver 0.0.0.0:8000

# Para producao usar uWSGI para servir o app e ter compatibilidade com Shibboleth
# https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
uwsgi \
  --socket 0.0.0.0:8001 \
  --wsgi-file /daiquiri_app/config/wsgi.py \
  --py-autoreload 1 \
  --static-map /daiquiri_static/=/daiquiri_app/static_root \
  --static-map /daiquiri_static/admin/=/daiquiri_app/static/admin \
  --buffer-size=32768 \
  --processes=4 \
  --threads=2



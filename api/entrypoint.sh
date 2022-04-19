#!/bin/bash
python3 manage.py migrate

python3 manage.py migrate catalog --database=catalog

python manage.py collectstatic --clear --noinput --verbosity 0


# Start Celery Workers
celery worker --workdir /app --app dri -l info &> /log/celery.log  &

# Start Celery Beat
celery worker --workdir /app --app dri -l info --beat &> /log/celery_beat.log  &

# python3 manage.py runserver 0.0.0.0:8000

# Para producao usar uWSGI para servir o app e ter compatibilidade com Shibboleth
# https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html
uwsgi \
  --socket 0.0.0.0:8000 \
  --wsgi-file /app/dri/wsgi.py \
  --py-autoreload 1 \
  --static-map /django_static/rest_framework/=/app/dri/static/rest_framework \
  --static-map /django_static/admin/=/app/dri/static/admin \
  --buffer-size=32768 \
  --processes=4 \
  --threads=2 



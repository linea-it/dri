#!/bin/bash
python3 manage.py migrate

python3 manage.py migrate catalog --database=catalog

python manage.py collectstatic --clear --noinput --verbosity 0


# Start Celery Workers
celery worker --workdir /app --app dri -l info &> /log/celery.log  &

# Start Celery Beat
celery worker --workdir /app --app dri -l info --beat &> /log/celery_beat.log  &

python3 manage.py runserver 0.0.0.0:8000




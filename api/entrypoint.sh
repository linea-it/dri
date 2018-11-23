#!/bin/bash
python3 manage.py migrate

python3 manage.py migrate catalog --database=catalog

python manage.py collectstatic --clear --noinput --verbosity 0

python3 manage.py runserver 0.0.0.0:8000

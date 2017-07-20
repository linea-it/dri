# DRI - Data Release Interface

[![Build Status](https://travis-ci.org/linea-it/dri.svg?branch=master)](https://travis-ci.org/linea-it/dri)
[![Coverage Status](https://coveralls.io/repos/github/linea-it/dri/badge.svg?branch=develop)](https://coveralls.io/github/linea-it/dri?branch=develop)

## Overview

## Requirements

Debian Jessie or Ubuntu OS 14
i386 or amd64

* In Debian Jessie / Ubuntu OS 14:

```
sudo apt-get update
sudo apt-get dist-upgrade
sudo apt-get install python3-pip python3-dev virtualenv git   ## use 'python-virtualenv' if 'virtualenv' does not exists
```

## Installation

Clone the repository to your home directory.

```
cd
umask 0022
echo "umask 0022" >> ~/.bashrc
git clone https://github.com/linea-it/dri.git dri
mkdir -p dri/db dri/log
chmod 755 dri
chmod 777 dri/db
chmod 777 dri/log
```

Create a virtualenv

```
cd ~/dri
virtualenv --no-site-packages --always-copy --python python3 env
```

Activation virtualenv

```
source env/bin/activate
```

### Installing the dependencies

To install all dependencies

```
pip3 install --upgrade setuptools pip virtualenv
pip3 install --upgrade -r api/requirements_dev.txt
python -c "import django; print(django.get_version())"      # Test django version, should be >= 1.9.4
```

### Settings

In directory dri/dri/settings there are configuration files for each environment.
The development environment is set by default (development.py file is set)

Edit the contents of the variable BASEPROJECT pointing to the home directory where the repository was cloned example:

```
cd ~/dri
cat api/dri/settings/local_vars.py.template | sed -e "s|#BASEPROJECT#|`pwd`|g" > api/dri/settings/local_vars.py
```

The structure of this part of the project is:

<pre>
dri/settings/
├── __init__.py
├── defaults.py
├── development.py
├── testing.py
├── production.py
├── local_vars.py.template
├── local_vars.py
</pre>

- defaults.py: global settings file and included for all other files.
- development.py: by default setted file in the absence of DJANGO_SETTINGS_MODULE variable, you can be to set apps and parameters used only by developers.
- testing.py: used in testing servers need to be set a environment variable with the value 'dri.settings.testing'
- production.py: used in production servers need to be set a environment variable with the 'dri.settings.production' value,
 in this file the variable debug should always be False and it is necessary to add the host allowed in ALLOWED_HOSTS
 parameter and allowed hosts CORS in variable CORS_ORIGIN_WHITELIST.

Database settings must be made individually on each of these files,
if you are a developer change only the development case file do not want to use sqlite as the default database.

### Setting Database Params

This step is needed only to use oracle database. The default sqlite is pre-configured in the repository files

## Setting up Database

```
cd api
cat > dri/settings/local.py << 'EOF'
from dri.settings.development import *
EOF
python manage.py migrate
python manage.py migrate catalog --database=catalog
```

## Create default Super User in django

```
echo "from django.contrib.auth.models import User; User.objects.create_superuser('dri-admin', '', 'desbrazil')" | python manage.py shell
```

## Create Django Static Files

```
python manage.py collectstatic --clear --noinput --verbosity 0
```

## Start the server

```
python manage.py runserver
```

## Testing
in the browser to access the URL

```
http://localhost:8000/
```

## Configuration Frontend + Backend

stops and back to the root of the project

```
^C   # Ctrl+C
```

Install Apache and configure dri

```
sudo apt-get install apache2 libapache2-mod-wsgi-py3
cd ~/dri
cat dri.conf | sed -e "s|#BASEPROJECT#|`pwd`|g" -e "s|#PROJECTUSER#|`whoami`|g" > dri.conf_apache
sudo cp dri.conf_apache /etc/apache2/sites-available/dri.conf
sudo chmod 644 /etc/apache2/sites-available/dri.conf
sudo rm -f /etc/apache2/sites-available/000-default.conf
rm -f dri.conf_apache
sudo a2ensite dri.conf
sudo service apache2 restart
```

NOTE: using a old system like Ubuntu 14 (or may be an i386), change the WSGI config in the dri.conf like follows

```
        #### WSGIDaemonProcess dri home=${BASEDIR}/api python-home=${BASEDIR}/env user=${EXECUSER}
        WSGIDaemonProcess dri python-path=${BASEDIR}/api:${BASEDIR}/env/lib/python3.4/site-packages user=${EXECUSER}
        #### WSGIProcessGroup dri
        WSGIApplicationGroup dri
        WSGIProcessGroup dri
        WSGIPassAuthorization On
```

This site alias is configured to dri.com
then you should add the following line to /etc/hosts

```
cat /etc/hosts | sed -e "s|\([[:space:]]\)localhost|\1localhost\1dri.com|g" > hosts
sudo mv hosts /etc/hosts
sudo chmod 644 /etc/hosts
```

## Develop database

Due some recent changes, dri login and home does not work in a fresh installed environment, so we will copy a dev db

```
cd ~/dri/db
rm -f *
wget -c http://devel2.linea.gov.br/~riccardo.campisano/dri_db/db_glauber_2017-07-20/dri.db.gz
gzip -d dri.db.gz
wget -c http://devel2.linea.gov.br/~riccardo.campisano/dri_db/db_glauber_2017-07-20/catalog.db.gz
gzip -d catalog.db.gz
cd ~/dri/api
python manage.py migrate
python manage.py migrate catalog --database=catalog
```

# Deactivate virtualenv when is no needed anymore

```
deactivate
```

## Documentation & Support

TODO

# DRI - Data Release Interface

## Overview

## Requirements
Python 3.4
Pip 
```
sudo apt-get install python3-pip
```
Virtualenv
```
sudo apt-get install python3.4-venv
```

## Installation
Create a directory where is the virtualenv and clone the repository.
```
mkdir dri
cd dri
```
Create a virtualenv
```
virtualenv --python=/usr/bin/python3.4 env
```
RedHat
```
virtualenv -p python3 env
```
Activation virtualenv
```
source env/bin/activate
```
Clone repository 
```
git clone https://github.com/linea-it/dri.git api
```
### Installing the dependencies
To install all dependencies Globally on your System.

if you are a developer run
```
pip install -r requirements_dev.txt
```
or 
```
pip install -r requirements.txt
```
### Settings

in directory dri/dri/settings there are configuration files for each environment.
by default is set the development.py file it does not need environment variable. for all other environments it is 
necessary to set the environment variable DJANGO_SETTINGS_MODULE pointing to the file that will be used, 
it is necessary to pass the full path to the file without the extension. 
example:

```
export DJANGO_SETTINGS_MODULE = dri.settings.production
```

<pre>
dri/settings/
├── __init__.py
├── defaults.py
├── development.py
├── testing.py
├── production.py
</pre>

- defaults.py: global settings file and included for all other files.
- development.py: by default setted file in the absence of DJANGO_SETTINGS_MODULE variable, you can be to set apps and parameters used only by developers.
- testing.py: used in testing servers need to be set a environment variable with the value 'dri.settings.testing'
- production.py: used in production servers need to be set a environment variable with the 'dri.settings.production' value,
 in this file the variable debug should always be False and it is necessary to add the host allowed in ALLOWED_HOSTS 
 parameter and allowed hosts CORS in variable CORS_ORIGIN_WHITELIST.

database settings must be made individually on each of these files, 
if you are a developer change only the development case file do not want to use sqlite as the default database.

### Setting Database Params
...

### Setting up Database
```
python manage.py makemigrations
python manage.py migrate
```
### Create a Super User in django
```
python manage.py createsuperuser
```
### Start the server
```
python manage.py runserver
```

## Testing
in the browser to access the URL
```
http://localhost:8000/
```

## Documentation & Support

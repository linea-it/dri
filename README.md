# DRI - Data Release Interface

## Overview

## Requirements
Python 3.4
Pip 
Virtualenv

* In Debian/Ubuntu OS:

```
sudo apt-get install python3-pip
sudo apt-get install python-virtualenv
sudo apt install virtualenv
```

* In RedHat/CentOS OS:
cd lo
```
sudo pip install virtualenv
sudo pip upgrade virtualenv
sudo pip install --upgrade virtualenv
virtualenv -p python3 env
```

## Installation
Clone the repository to your home directory.
```
git clone https://github.com/linea-it/dri.git dri
cd dri
```
Create a virtualenv

* In Debian/Ubuntu OS:

```
virtualenv --python=/usr/bin/python3.4 env
```

* In RedHat/CentOS OS:

```
virtualenv -p python3 env
```
Activation virtualenv
```
source env/bin/activate
```

### Installing the dependencies
To install all dependencies Globally on your System.

if you are a developer run
```
pip install -r api/requirements_dev.txt
```
or 
```
pip install -r api/requirements.txt
```
### Settings

In directory dri/dri/settings there are configuration files for each environment.
The development environment is set by default (development.py file is set)

```
cp api/dri/settings/local_vars.py.template api/dri/settings/local_vars.py
vim api/dri/settings/local_vars.py
```
Edit the contents of the variable BASEPROJECT pointing to the home directory where the repository was cloned example:
```
BASE_PROJECT = '/home/<user>/dri'
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
...

## Setting up Database
```
cd api
python manage.py migrate
```
## Create a Super User in django
```
python manage.py createsuperuser
```
## Create Django Static Files
```
python manage.py collectstatic
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

back to the root of the project
```
cd ..
```
copy dri.conf to directory sites-available
```
sudo cp dri.conf /etc/apache2/sites-available/
```
Edit the file to put the path where the clone and the User was made that will run wsgi (use the same home User)
```
sudo vim /etc/apache2/sites-available/dri.conf
```
Edit the variable
```
BASEDIR /home/<user>/dri
EXECUTE <user>
```
Enable
```
sudo a2ensite dri.conf
sudo service apache2 reload
```
This site alias is configured to dri.com
then you should add the following line to /etc/hosts
```
sudo vim /etc/hosts 
```
```
127.0.0.1       dri.com
```
or edit dri.conf and configure the virtual host to a different port


## Documentation & Support

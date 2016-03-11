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
virtualenv --python=/usr/bin/python3.4 dri_env
```
Activation virtualenv
```
source dri_env/bin/activate
```
Clone repository
```
git clone https://github.com/linea-it/dri.git
```
### Installing the dependencies
To install all dependencies Globally on your System, run
```
pip install -r requirements.txt
```
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

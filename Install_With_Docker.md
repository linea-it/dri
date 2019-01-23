
## Instalation 

Clone the repository to your directory.
```
git clone https://github.com/linea-it/dri.git dri
mkdir dri/log dri/archive dri/log

```

### Build Containers

```
cd dri
docker-compose build
```

### Settings

In directory dri/dri/settings there are configuration files for each environment.
The development environment is set by default (development.py file is set)

```
cp api/dri/settings/local_vars.py.template api/dri/settings/local_vars.py
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

### Run All Services
```
docker-compose up

```

### Create default Super User in django

```
docker exec -it $(docker ps -q -f name=backend) python manage.py createsuperuser
```

### Useful Commands

Returns the ID of a container by filtering by name
```
docker ps -q -f name=backend
```

Access the terminal in the backend container.
```
docker exec -it $(docker ps -q -f name=backend) \bin\bash
```

List of commands available in Django
```
docker exec -it $(docker ps -q -f name=backend) python manage.py --help
```

Nginx Reload
```
docker exec -it $(docker ps -q -f name=nginx) nginx -s reload
```


### Rabbit + Celery
Descobrir o IP do container rabbit
```
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f name=rabbit)
```
Acessar a interface do rabbit, utilizar o user e pass declarado no docker-compose, RABBITMQ_DEFAULT_USER e RABBITMQ_DEFAULT_PASS
```
http://<ip_rabbit>:15672
```

Start celery Works and Beat manually. inside backend container run 
```
celery worker --workdir /app --app dri -l info

celery worker --workdir /app --app dri -l info
```
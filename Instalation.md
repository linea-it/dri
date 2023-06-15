# Instalation

Clone the repository to your directory.

```
git clone https://github.com/linea-it/dri.git dri

```
Create directories

```bash
mkdir archive log log/backend log/nginx
```

Create docker-compose

```bash
cd dri
cp docker-compose-development.yml docker-compose.yml
```

## Setup Frontend development enviroment

DRI have multiple frontend apps, some of them developed with Sencha EXTjs and others with ReactJS.

For react apps, you need to run the yarn command to create the node_modules directory with the dependencies.

```bash
docker-compose run landingpage yarn
docker-compose run eyeballing yarn
```

## Setup Backend and Database
---------

In directory dri/dri/settings there are configuration files for each environment.
The development and production environment is set by local_vars.py that needs to be copied from local_vars.py.template

``` bash
cp api/dri/settings/local_vars.py.template local_vars.py
```

### Settings
The structure of this part of the project is:
<pre>
dri/settings/
├── __init__.py
├── defaults.py
├── jenkins.py
├── local_vars.py.template
├── local_vars.py
</pre>

* defaults.py: global settings file and included for all other files.


* In Production: The variable debug should always be False and it is necessary to add the host allowed in ALLOWED_HOSTS
 parameter and allowed hosts CORS in variable CORS_ORIGIN_WHITELIST.

### Setting Postgresql Database

Considering a new installation in a development environment with the postgresql + q3c database.

Database settings must be made only in local_vars.py,

Whereas the database used is postgresql + q3c and a development environment. the configuration of local_vars.py in the databases attribute is as follows.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
        'OPTIONS': {
            'options': '-c search_path=dri_admin,public'
        }
    },
    'catalog': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'database',
        'PORT': 5432,
        'OPTIONS': {
            'options': '-c search_path=dri_catalog,public'
        },
    },
}
```

Starting the database container alone, the first time will create the pg_data and pg_backups directory and create the user based on the POSTGRES_DB and POSTGRES_PASSWORD environment variables both with default value 'postgres' the user created is also 'postgres'

starts the database container

```bash
docker-compose up database
```

it is necessary to create 2 schemas, one for the administrative tables and the other for catalog tables.
in the catalog schema are the tables created by the users.

Creates the administrative schema, in this example it is called dri_admin

```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_admin;"
```

Changes the permission for the schema, considering that the user is postgres.
```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_admin OWNER TO postgres;"
```

Same thing for the dri_catalog schema
```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_catalog;"
```

```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_catalog OWNER TO postgres;"
```

### Setup Backend

With the configuration file local_vars.py configured. it's time to raise the backend.

The first time the backend is executed, administrative tables and basic catalog tables will be created.
Django takes care of this part, there is no need to do anything, the commands are in the start.sh that is executed every time the backend container is turned on.

```bash
# Starts only the containers needed for the backend.
docker-compose up backend
```

Now that the backend is on, it is necessary to load the initial data and create an admin user.

### Create default Super User in django

With the backend running, open another terminal and run the command create super user

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Load Initial Data

For admin database

```bash
docker-compose exec backend python manage.py loaddata initial_data.json
```

### Register Releases **Optional**

Access to the DES database (desoper) is required, run the datadiscovery command to register the release and tiles. Release name must be as it is in oracle.

```bash
docker-compose exec backend python manage.py datadiscovery --tag Y6A2_COADD
```

### Example catalog, outside the DRI catalog database.

The step below is **optional**, do not perform this part unless you know what you are doing

```bash
docker exec -it $(docker ps -q -f name=dri_database) psql -h localhost -U postgres -d postgres  -f /data/gaia_dump.sql
```

this example creates a gaia schema with a gaia_dr2 table and a subset of data with some objects.


TODO: Rever esta parte
## Shibboleth
```bash
cp .env-shib .env
```


## Run and Stop All Services

```bash
docker-compose up
```

or

```bash
docker-compose stop && docker-compose up -d
```

## Useful Commands

Returns the ID of a container by filtering by name

```bash
docker ps -q -f name=backend
```

Access the terminal in the backend container.

```bash
docker-compose exec backend bash
```

List of commands available in Django

```bash
docker-compose exec backend python manage.py --help
```

Nginx Reload

```bash
docker exec -it $(docker ps -q -f name=nginx) nginx -s reload
```

Dump a schema from database postgres

```bash
docker exec -it $(docker ps -q -f name=dri_database) pg_dump  -h localhost -U postgres -n 'gaia' postgres > /data/gaia_dump.sql
```

Dump data using Django

```bash
docker exec -it $(docker ps -q -f name=dri_backend) python manage.py dumpdata product_classifier --indent 2 > product_classifier.json
```

Neste exemplo product_classifier é o Django App com todos os models. product_classifier.json é o arquivo com o dump.

### Rabbit + Celery

Descobrir o IP do container rabbit

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f name=rabbit)
```

Acessar a interface do rabbit, utilizar o user e pass declarado no docker-compose, RABBITMQ_DEFAULT_USER e RABBITMQ_DEFAULT_PASS

```bash
http://<ip_rabbit>:15672
```

Start celery Works and Beat manually. inside backend container run

```bash
celery worker --workdir /app --app dri -l info

celery worker --workdir /app --app dri -l info
```

Build Manual das imagens docker
```bash
docker build -t linea/dri:backend_$(git describe --always) .
docker build -t linea/dri:frontend_$(git describe --always) .
```

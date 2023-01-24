## Instalation

Clone the repository to your directory.

```
git clone https://github.com/linea-it/dri.git dri

```

### Create directories

```
mkdir archive log log/backend log/nginx log/daiquiri archive/daiquiri archive/daiquiri/static archive/daiquiri/files archive/daiquiri/download archive/daiquiri/upload
```

### Build Containers

```
cd dri
cp docker-compose-development.yml docker-compose.yml
docker-compose build
```

### Settings

In directory dri/dri/settings there are configuration files for each environment.
The development environment is set by default (development.py file is set)

```
cp api/dri/settings/local_vars.py.template local_vars.py

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

* defaults.py: global settings file and included for all other files.
* development.py: by default setted file in the absence of DJANGO_SETTINGS_MODULE variable, you can be to set apps and parameters used only by developers.
* testing.py: used in testing servers need to be set a environment variable with the value 'dri.settings.testing'
* production.py: used in production servers need to be set a environment variable with the 'dri.settings.production' value,

 in this file the variable debug should always be False and it is necessary to add the host allowed in ALLOWED_HOSTS
 parameter and allowed hosts CORS in variable CORS_ORIGIN_WHITELIST.

## Setting Database

### Postgresql

Considering a new installation in a development environment with the postgresql + q3c database.

Database settings must be made only in local_vars.py,

Whereas the database used is postgresql + q3c and a development environment. the configuration of local_vars.py in the databases attribute is as follows.

```
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

```
# starts the database container
docker-compose up database
```

it is necessary to create 2 schemas, one for the administrative tables and the other for catalog tables.
in the catalog schema are the tables created by the users.

```
# Creates the administrative schema, in this example it is called dri_admin
docker-compose exec database  psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_admin;"

# Changes the permission for the schema, considering that the user is postgres.
docker-compose exec database  psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_admin OWNER TO postgres;"

# Same thing for the dri_catalog schema
docker-compose exec database  psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_catalog;"

docker-compose exec database  psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_catalog OWNER TO postgres;"

```

## Setup Backend

Criar uma SECRET_KEY que deve ser adicionada ao arquivo local_vars.py
deve ser unica por ambiente.

```bash
docker-compose run backend python -c "import secrets; print(secrets.token_urlsafe())"
```

Copiar a chave gerada e adicionar a variavel SECRET_KEY.

With the configuration file local_vars.py configured. it's time to raise the backend.

The first time the backend is executed, administrative tables and basic catalog tables will be created.
Django takes care of this part, there is no need to do anything, the commands are in the entrypoint.sh that is executed every time the backend container is turned on.

```
# Starts only the containers needed for the backend.
docker-compose up backend
```

Now that the backend is on, it is necessary to load the initial data and create an admin user.

### Create default Super User in django

```
docker-compose exec backend python manage.py createsuperuser
```

### Load Initial Data

For admin database

```bash
docker-compose exec backend python manage.py loaddata initial_data.json
```

### Daiquiri

Create the Django administration database for Daiquiri app:

```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "CREATE DATABASE daiquiri_admin;"
```

Create the "data" (to store catalogs, users' jobs results, metadata) database:

```bash
docker-compose exec database psql -h localhost -U postgres -d postgres -c "CREATE DATABASE daiquiri_data;"
```

Enviroments Variables for Daiquiri app.

```bash
cp daiquiri/.env.sample daiquiri/.env
```

Criar um SECRET_KEY.

```bash
docker-compose run daiquiri python -c "import secrets; print(secrets.token_urlsafe())"
```

Editar o arquivo daiquiri/.env utilizar os valores adequados para o ambiente que está sendo instalado.

OBS: A app não inicializa se a variavel SECRET_KEY estiver em branco.

### Install Frontend Dependencies

Antes de ligar os apps de frontend a primeira vez é necessário,
rodar o comando yarn nos apps que usam react (eyeballing e landing page).

```bash
cd eyeballing 
yarn

cd ../landing_page
yarn
```

### Register Releases

Access to the DES database (desoper) is required, run the datadiscovery command to register the release and tiles. Release name must be as it is in oracle.

```bash
docker exec -it $(docker ps -q -f name=dri_backend) python manage.py datadiscovery --tag Y6A2_COADD
```

### Example catalog, outside the DRI catalog database

The step below is **optional**, do not perform this part unless you know what you are doing

```bash
docker exec -it $(docker ps -q -f name=dri_database) psql -h localhost -U postgres -d postgres  -f /data/gaia_dump.sql
```

this example creates a gaia schema with a gaia_dr2 table and a subset of data with some objects.

## Run and Stop All Services

```bash
docker-compose up
```

or

```bash
docker-compose stop
```

## Shibboleth

```bash
cp .env-shib .env
```

## Useful Commands

Returns the ID of a container by filtering by name

```bash
docker ps -q -f name=backend
```

Access the terminal in the backend container.

```bash
docker exec -it $(docker ps -q -f name=backend) \bin\bash
```

List of commands available in Django

```bash
docker exec -it $(docker ps -q -f name=backend) python manage.py --help
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

# Instalation

Clone the repository to your directory.
Create directories
Create docker compose

```bash
git clone https://github.com/linea-it/dri.git dri
&& cd dri
&& mkdir archive log log/backend log/nginx
&& cp docker compose-development.yml docker compose.yml
```

## Setup Frontend development enviroment

DRI have multiple frontend apps, some of them developed with Sencha EXTjs and others with ReactJS.

For react apps, you need to run the yarn command to create the node_modules directory with the dependencies.

```bash
docker compose run landingpage yarn
docker compose run eyeballing yarn
```

## Setting Postgresql Database

Considering a new installation in a development environment with the postgresql + q3c database.

Database settings must be made only in local_vars.py,

Starting the database container alone, the first time will create the pg_data and pg_backups directory and create the user based on the POSTGRES_DB and POSTGRES_PASSWORD environment variables both with default value 'postgres' the user created is also 'postgres'

starts the database container

```bash
docker compose up database
```

it is necessary to create 2 schemas, one for the administrative tables and the other for catalog tables.
in the catalog schema are the tables created by the users.

Creates the administrative schema, in this example it is called dri_admin

```bash
docker compose run database psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_admin;"
```

Changes the permission for the schema, considering that the user is postgres.
```bash
docker compose run database psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_admin OWNER TO postgres;"
```

Same thing for the dri_catalog schema
```bash
docker compose run database psql -h localhost -U postgres -d postgres -c "CREATE SCHEMA dri_catalog;"
```

```bash
docker compose run database psql -h localhost -U postgres -d postgres -c "ALTER SCHEMA dri_catalog OWNER TO postgres;"
```

### Setup Backend

In directory dri/dri/settings there are configuration files for each environment.
The development and production environment is set by local_vars.py that needs to be copied from local_vars.py.template

``` bash
cp api/dri/settings/local_vars.py.template local_vars.py
```

With the configuration file local_vars.py configured. it's time to raise the backend.

The first time the backend is executed, administrative tables and basic catalog tables will be created.
Django takes care of this part, there is no need to do anything, the commands are in the start.sh that is executed every time the backend container is turned on.

```bash
# Starts only the containers needed for the backend.
docker compose up backend
```

Now that the backend is on, it is necessary to load the initial data and create an admin user.

### Create default Super User in django

With the backend running, open another terminal and run the command create super user

```bash
docker compose run backend python manage.py createsuperuser
```

### Load Initial Data

For admin database

```bash
docker compose run backend python manage.py loaddata initial_data.json
```

### Catalog database using SSH Tunel.

```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```
Neste comando substitua <linea_user> pelo seu usuario de acesso a srvlogin e <local_port> por uma porta disponivel na sua maquina por ex: 3307.

É necessário sempre executar esse comando antes de ligar o ambiente.

Neste caso a settings ficaria 
    'catalog': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'prod_gavo',
        'USER': 'untrustedprod',
        'PASSWORD': 'untrusted',
        'HOST': 'host.docker.internal',
        'PORT': 3307,
        'OPTIONS': {
            'options': '-c search_path=dri_catalog,public'
        },
    },

## Run and Stop All Services

```bash
docker compose up -d
```

or

```bash
docker compose stop && docker compose up -d
```

## Useful Commands

Returns the ID of a container by filtering by name

```bash
docker ps -q -f name=backend
```

Access the terminal in the backend container.

```bash
docker compose exec backend bash
```

List of commands available in Django

```bash
docker compose exec backend python manage.py --help
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

Acessar a interface do rabbit, utilizar o user e pass declarado no docker compose, RABBITMQ_DEFAULT_USER e RABBITMQ_DEFAULT_PASS

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

# Instalation

Clone the repository to your directory. 

Inside project folder dri:
- Create directories (archive log log/backend log/nginx)
- Copy docker-compose.yml from docker-compose-development.yml

```bash
git clone https://github.com/linea-it/dri.git dri \
&& cd dri \
&& mkdir archive log log/backend log/nginx log/iipserver \
&& cp docker-compose-development.yml docker-compose.yml \
&& cp api/dri/settings/local_vars.py.template local_vars.py
```

Check your linux user id with: 

```bash
echo $UID
```
and update it in the `docker-compose.yml` file if necessary (if it is not the usual 1000). 


## Setup Frontend development enviroment

DRI have multiple frontend apps, some of them developed with Sencha EXTjs and others with ReactJS.

For react apps, you need to run the yarn command to create the node_modules directory with the dependencies.

```bash
docker compose run landingpage yarn
```

```bash
docker compose run eyeballing yarn
```

**OBS**: Para o live reload é necessário acessar os apps a partir das portas de dev. 
- landing page: http://localhost:3001
- Tile Viewer: http://localhost:3000

## Setting Postgresql Database

Considering a new installation in a development environment with the postgresql + q3c database.

Database settings must be made only in local_vars.py,

Starting the database container alone, the first time will create the pg_data and pg_backups directory and create the user based on the POSTGRES_DB and POSTGRES_PASSWORD environment variables both with default value 'postgres' the user created is also 'postgres'

starts the database container

```bash
docker compose up database
```

When finished, it will print the message: `database-1  | LOG:  database system is ready to accept connections`. Press `Ctrl+C` to stop before going to the next step. 

### Setup Backend

In directory dri/dri/settings there are configuration files for each environment.
The development and production environment is set by local_vars.py that needs to be copied from local_vars.py.template

With the configuration file local_vars.py configured. it's time to raise the backend.

The first time the backend is executed, administrative tables and basic catalog tables will be created.
Django takes care of this part, there is no need to do anything, the commands are in the start.sh that is executed every time the backend container is turned on.

```bash
# Starts only the containers needed for the backend.
docker compose up backend
```

Now that the backend is on (it should display a message like this: `backend-1  | spawned uWSGI worker 4 (pid: 56, cores: 2)`), it is necessary to load the initial data and create an admin user. Press `Ctrl+C` to stop before going to the next step.  

### Create default Super User in django

With the backend running, open another terminal and run the command create super user

```bash
docker compose run backend python manage.py createsuperuser
```

### Load Initial Data

This command will populate the database with
- DR2 public release data (list of images and datasets)
- Some example target lists (associated with user id 1)

```bash
docker compose run backend python manage.py loaddata initial_data.json
```

### Catalog database using SSH Tunel.

```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```
In this command, replace <linea_user> for your username used to access srvlogin and <local_port> for an available port on your machine, for instance: 3307. 

It is always necessary to execute this command before turning the environment on. 

In this case, the settings would be:  
```python
    'prod_gavo': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'prod_gavo',
        'USER': 'untrustedprod',
        'PASSWORD': '<password>',
        'HOST': 'host.docker.internal',
        'PORT': 3307,
    },
```
## Run and Stop All Services

```bash
docker compose up -d
```

or

```bash
docker compose stop && docker compose up -d
```

## Useful Commands

Build Manual das imagens docker
```bash
# Build Backend deve ser executado dentro da pasta api.
cd api
docker build -t linea/dri:backend_$(git describe --always) .

# Build Frontend deve ser executado dentro da pasta frontend.
cd frontend
docker build -t linea/dri:frontend_$(git describe --always) .
```

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

Access the rabbit interface, use the user and pass declared in docker compose, RABBITMQ_DEFAULT_USER and RABBITMQ_DEFAULT_PASS

```bash
http://<ip_rabbit>:15672
```

Start celery Works and Beat manually. inside backend container run

```bash
celery worker --workdir /app --app dri -l info

celery worker --workdir /app --app dri -l info
```

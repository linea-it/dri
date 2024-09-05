# Instalation


```bash
git clone https://github.com/linea-it/dri.git dri_temp \
&& cp -r dri_temp/compose/production/ scienceserver \
&& rm -rf dri_temp \
&& cd scienceserver/ \
&& mkdir -p data data/tmp log certificates \
&& mv env_template .env \
```

Generate SAML2 Certificates
```bash
cd certificates \
&& openssl genrsa -out mykey.key 2048 \
&& openssl req -new -key mykey.key -out mycert.csr \
&& openssl x509 -req -days 365 -in mycert.csr -signkey mykey.key -out mycert.crt \
&& cp mykey.key mykey.pem \
&& cp mycert.crt mycert.pem \
&& cd ..
```

## Setting Postgresql Database


```bash
docker compose up database
```

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

Build Manual das imagens docker
```bash
cd api && docker build -t linea/dri:backend_$(git describe --always) .

cd frontend && docker build -t linea/dri:frontend_$(git describe --always) .
```

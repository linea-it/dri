FROM python:3.9.7-buster
ENV PYTHONUNBUFFERED 1
RUN mkdir /daiquiri_app /archive /archive/tmp /log
WORKDIR /daiquiri_app

RUN useradd -m -d /srv/daiquiri -c "Daiquiri user" -s /bin/bash daiquiri

RUN wget --no-check-certificate --quiet -q -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main 13" | tee /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get install -y --force-yes \
  git \
  build-essential \
  libxml2-dev libxslt-dev \
  zlib1g-dev \
  libssl-dev \
  python3-dev \
  python3-venv \
  postgresql-client-13


ADD requirements.txt /daiquiri_app

RUN pip install --upgrade pip \
  && pip install -r requirements.txt

ADD . /daiquiri_app/

# ENTRYPOINT ./entrypoint.sh

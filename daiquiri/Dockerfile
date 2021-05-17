FROM python:3.6.4
ENV PYTHONUNBUFFERED 1
RUN mkdir /daiquiri_app /archive /archive/tmp /log
WORKDIR /daiquiri_app

RUN useradd -m -d /srv/daiquiri -c "Daiquiri user" -s /bin/bash daiquiri

RUN apt-get update && apt-get install -y --force-yes \
  git \
  build-essential \
  libxml2-dev libxslt-dev \
  zlib1g-dev \
  libssl-dev \
  python3-dev \
  python3-venv

ADD requirements.txt /daiquiri_app

RUN pip install --upgrade pip \
  && pip install -r requirements.txt

ADD . /daiquiri_app/

# ENTRYPOINT ./entrypoint.sh

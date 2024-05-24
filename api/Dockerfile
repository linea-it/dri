# FROM python:3.6.4
FROM python:3.8.18-slim

# If this is set to a non-empty string, Python won’t try
# to write .pyc files on the import of source modules
ENV PYTHONDONTWRITEBYTECODE=1

# Force the stdout and stderr streams to be unbuffered.
# This option has no effect on the stdin stream.
ENV PYTHONUNBUFFERED=1

# TODO: Rever esse error
# Fix W: Failed to fetch http://deb.debian.org/debian/dists/jessie-updates/InRelease  Unable to find expected entry 'main/binary-amd64/Packages' in Release file (Wrong sources.list entry or malformed file)
# RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list

RUN apt-get update && apt-get install -y  \
    python3-dev build-essential libaio-dev \
    libsasl2-dev libldap2-dev libssl-dev unzip 

# Install Oracle Client
ADD /oracle /tmp/oracle
RUN mkdir /oracle \
    && unzip /tmp/oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /oracle \
    && unzip /tmp/oracle/instantclient-sdk-linux.x64-12.2.0.1.0.zip -d /oracle \
    && mv /oracle/instantclient_12_2 /oracle/instantclient \
    && ln -s /oracle/instantclient/libclntsh.so.12.2 /oracle/instantclient/libclntsh.so \
    && ln -s /oracle/instantclient/libocci.so.12.2 /oracle/instantclient/libocci.so \
    && export ORACLE_HOME=/oracle/instantclient \
    && export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME \
    && export OCI_HOME=/oracle/instantclient \
    && export OCI_LIB_DIR=/oracle/instantclient \
    && export OCI_INCLUDE_DIR=/oracle/instantclient/sdk/include \
    && rm -rf /tmp/oracle

# ENV ORACLE_HOME=/oracle/instantclient
# ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME
# ENV OCI_HOME=/oracle/instantclient
# ENV OCI_LIB_DIR=/oracle/instantclient
# ENV OCI_INCLUDE_DIR=/oracle/instantclient/sdk/include


# Install python packages
COPY requirements.txt /tmp/pip-tmp/
RUN pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

ARG USERNAME=dri
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# add user so we can run things as non-root
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && mkdir /app /app/django_static /archive /archive/tmp /log /log/backend /log/nginx \
    && chown -R $USER_UID:$USER_GID /app /app/django_static /archive /archive/tmp /log /log/backend /log/nginx \
    && export PYTHONPATH=/app:$PYTHONPATH

# ENV PYTHONPATH="/app:$PYTHONPATH"

WORKDIR /app

ADD . /app

COPY --chmod=0775 ./entrypoint.sh /entrypoint.sh
COPY --chmod=0775 ./start.sh /start.sh
COPY --chmod=0775 ./start_celery_worker.sh /start_celery_worker.sh
COPY --chmod=0775 ./start_celery_beat.sh /start_celery_beat.sh

ENTRYPOINT ["/entrypoint.sh"]

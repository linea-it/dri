ARG BUILD_ENVIRONMENT=local

FROM python:3.9-slim AS base

ARG BUILD_ENVIRONMENT
ARG USERNAME=dri
ARG USER_UID=1000
ARG USER_GID=1000

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
    build-essential \
    python3-dev \ 
    python3-setuptools \
    libaio-dev \
    libsasl2-dev \
    libldap2-dev \
    libssl-dev \
    xmlsec1 \
    unzip \
    git \
    zsh \
    wget \
    curl \
    vim

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

# Install python packages
COPY ./requirements /tmp/pip-tmp/
RUN pip install --upgrade pip setuptools wheel \
    && pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/$BUILD_ENVIRONMENT.txt \
    && rm -rf /tmp/pip-tmp

FROM base AS dri-local
# Install Github CLI
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md
RUN mkdir -p -m 755 /etc/apt/keyrings && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh -y

# Install ACT
# https://lindevs.com/install-act-on-ubuntu
RUN wget -qO act.tar.gz https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz \
    && tar xf act.tar.gz -C /usr/local/bin act \
    && act --version \
    && rm -rf act.tar.gz

FROM base AS dri-production

FROM dri-$BUILD_ENVIRONMENT

# add user so we can run things as non-root
# https://code.visualstudio.com/remote/advancedcontainers/add-nonroot-user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && useradd --uid 50017 --gid $USER_GID -m app.deployer \
    && mkdir /app /app/django_static /archive /archive/tmp /log /log/backend /log/nginx \
    && chown -R $USER_UID:$USER_GID /app /app/django_static /archive /archive/tmp /log /log/backend /log/nginx \
    && chmod -R 755 /app \
    && export PYTHONPATH=/app:$PYTHONPATH

WORKDIR /app

COPY . /app

COPY --chmod=0775 ./entrypoint.sh /entrypoint.sh
COPY --chmod=0775 ./start.sh /start.sh
COPY --chmod=0775 ./start_celery_worker.sh /start_celery_worker.sh
COPY --chmod=0775 ./start_celery_beat.sh /start_celery_beat.sh


USER $USERNAME

# Install Oh My Zsh
RUN sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)" --unattended

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

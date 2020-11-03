FROM python:3.6.4
ENV PYTHONUNBUFFERED 1
RUN mkdir /app /archive /archive/tmp /log
WORKDIR /app
# Install Oracle Client
ADD /oracle /app/oracle

# TODO: Rever esse error
# Fix W: Failed to fetch http://deb.debian.org/debian/dists/jessie-updates/InRelease  Unable to find expected entry 'main/binary-amd64/Packages' in Release file (Wrong sources.list entry or malformed file)
RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list

RUN apt-get update && apt-get install -y --force-yes \
    python-dev build-essential libaio-dev \
    libsasl2-dev libldap2-dev libssl-dev unzip 

RUN mkdir /oracle && \
    unzip /app/oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /oracle && \
    unzip /app/oracle/instantclient-sdk-linux.x64-12.2.0.1.0.zip -d /oracle && \
    mv /oracle/instantclient_12_2 /oracle/instantclient && \
    ln -s /oracle/instantclient/libclntsh.so.12.2 /oracle/instantclient/libclntsh.so && \
    ln -s /oracle/instantclient/libocci.so.12.2 /oracle/instantclient/libocci.so

ENV ORACLE_HOME=/oracle/instantclient
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME
ENV OCI_HOME=/oracle/instantclient
ENV OCI_LIB_DIR=/oracle/instantclient
ENV OCI_INCLUDE_DIR=/oracle/instantclient/sdk/include


ADD requirements.txt /app

RUN pip install --upgrade pip \
    && pip install -r requirements.txt


ADD . /app/

# ENTRYPOINT ./entrypoint.sh 
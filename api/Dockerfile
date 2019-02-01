FROM python:3.6.4
ENV PYTHONUNBUFFERED 1
RUN mkdir /app
WORKDIR /app
# Install Oracle Client
ADD /oracle /app/oracle

RUN mkdir /oracle
RUN apt-get update
RUN apt-get install unzip
RUN apt-get install python-dev -y
RUN apt-get install build-essential -y
RUN apt-get -y install libaio-dev
RUN unzip /app/oracle/instantclient-basic-linux.x64-12.2.0.1.0.zip -d /oracle
RUN unzip /app/oracle/instantclient-sdk-linux.x64-12.2.0.1.0.zip -d /oracle
RUN mv /oracle/instantclient_12_2 /oracle/instantclient
RUN ln -s /oracle/instantclient/libclntsh.so.12.2 /oracle/instantclient/libclntsh.so
RUN ln -s /oracle/instantclient/libocci.so.12.2 /oracle/instantclient/libocci.so

ENV ORACLE_HOME=/oracle/instantclient
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME

ENV OCI_HOME=/oracle/instantclient
ENV OCI_LIB_DIR=/oracle/instantclient
ENV OCI_INCLUDE_DIR=/oracle/instantclient/sdk/include

ADD . /app/

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

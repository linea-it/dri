#!/bin/bash
if [ ! -z $NCSA ]; then
    rpm -i /oracle/oracle-instantclient12.1-basic-12.1.0.2.0-1.x86_64.rpm
    export LD_LIBRARY_PATH=/usr/lib/oracle/12.1/client64/lib:$LD_LIBRARY_PATH
    pip install -r requirements_ncsa.txt
fi
python3 manage.py runserver 0.0.0.0:8000

#!/bin/sh

# /etc/passwd will use sh
# we want to force the use of bash to have the startup env variables

bash -l -i -c '

function error_exit {
    echo "$1" >&2
    exit "${2:-1}"
}

echo
echo "= Data Discovery ="
cd $DRI_HOME

echo
echo "= Setting up env ="
source env/bin/activate || error_exit "Error, exit" 1

echo
echo "= Entering in the application folder ="
cd api || error_exit "Error, exit" 2

echo
echo "= Running command ="
python manage.py datadiscovery || error_exit "Error, exit" 3

echo
echo "= Exiting ="
deactivate' && exit 0 || exit 127

# End

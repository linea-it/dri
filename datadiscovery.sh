#!/bin/sh

bash -l -i -c '

function error_exit {
    echo "$1" >&2
    exit "${2:-1}"
}

if test -z "$1"; then
    error_exit "Usage: $0 <ReleaseName>" 1
fi;

echo
echo "= Data Discovery ="
cd $DRI_HOME

echo
echo "= Setting up env ="
source env/bin/activate || error_exit "Error, exit" 2

echo
echo "= Entering in the application folder ="
cd api || error_exit "Error, exit" 3

echo
echo "= Running command ="
python manage.py datadiscovery --tag "$1" || error_exit "Error, exit" 4

echo
echo "= Exiting ="
deactivate' "$0" "$1" && exit 0 || exit $?

# End

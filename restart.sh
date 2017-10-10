#!/bin/sh

# /etc/passwd will use sh
# we want to force the use of bash to have the startup env variables

bash -l -i -c '

function error_exit {
    echo "$@" >&2
    exit "${2:-1}"
}

echo "= Restart rabbitmq-server ="
sudo /etc/init.d/rabbitmq-server stop || error_exit "Error, exit" 16
sudo /etc/init.d/rabbitmq-server start || error_exit "Error, exit" 17

echo
echo "= Reloading celerybeat ="
sudo /etc/init.d/celerybeat stop || error_exit "Error, exit" 18
sudo /etc/init.d/celerybeat start || error_exit "Error, exit" 19

echo
echo "= Reloading celeryd ="
sudo /etc/init.d/celeryd stop || error_exit "Error, exit" 20
sudo /etc/init.d/celeryd start || error_exit "Error, exit" 21

echo
echo "= Reloading apache ="
sudo /etc/init.d/apache2 stop || error_exit "Error, exit" 22
sudo /etc/init.d/apache2 start || error_exit "Error, exit" 23

exit 0 '

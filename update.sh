#!/bin/sh

# /etc/passwd will use sh
# we want to force the use of bash to have the startup env variables

bash -l -i -c '

function error_exit {
    echo "$@" >&2
    exit "${2:-1}"
}

# vars
BKP_PATH=bkp
DB_PATH=db
LOG_PATH=log

mkdir -p "${BKP_PATH}"  || error_exit "Error, exit" 1
cd $DRI_HOME

echo
echo "= Backup database ="
TOFILE="${BKP_PATH}/bkp_"`basename "${DB_PATH}"`"_"`date +%Y-%m-%d_%H-%M-%S`".tgz"
tar -czf "${TOFILE}" "${DB_PATH}" || error_exit "Error, exit" 2

echo
echo "= Backup and refresh logs ="
TOFILE="${BKP_PATH}/bkp_"`basename "${LOG_PATH}"`"_"`date +%Y-%m-%d_%H-%M-%S`".tgz"
tar -czf "${TOFILE}" "${LOG_PATH}" || error_exit "Error, exit" 3
find "${LOG_PATH}" -type f \( -name \*.log -o -name celery -o -name worker1 -o -name worker1.pid \) -exec rm -f {} \; || error_exit "Error, exit" 4

echo
echo "= Updating the code ="
git pull || error_exit "Error, exit" 5

echo
echo "= Setting up env ="
source env/bin/activate || error_exit "Error, exit" 6

echo
echo "= Updating requirements ="
pip3 install -U -r api/requirements.txt || error_exit "Error, exit" 7

echo
echo "= Entering in the application folder ="
cd api  || error_exit "Error, exit" 8

echo
echo "= Updating the database structure ="
python manage.py migrate || error_exit "Error, exit" 9

#echo
#echo "= Importing the database data ="
#python manage.py loaddata initial_data.json || error_exit "Error, exit" 10

echo
echo "= Cleaning up the auto-generated static files ="
python manage.py collectstatic --clear --noinput --verbosity 0 || error_exit "Error, exit" 11
cd ..

### REMEMBER TO IMPLEMENT A WAY TO apache reload
# this can be done using
# - iptables or a nginx/varnish at 80 with proxies at 8080
#   http://stackoverflow.com/questions/525672/is-there-a-way-to-start-restart-stop-apache-server-on-linux-as-non-root-user
# - using sudo only for the reload command
#   https://www.quora.com/How-can-I-grant-a-user-access-to-run-etc-init-d-apache2-reload-without-giving-them-sudo-or-root
# - enabling a non root user to open the port 80
#   http://askubuntu.com/questions/694036/apache-as-non-root

echo
echo "= Reloading apache ="
sudo /etc/init.d/apache2 reload || error_exit "Error, exit" 12

echo
echo "= Exiting ="
deactivate' && exit 0 || exit 127



# End

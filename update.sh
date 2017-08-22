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
DATE=`date +%Y-%m-%d_%H-%M-%S`

mkdir -p "${BKP_PATH}/${DATE}" || error_exit "Error, exit" 1
cd $DRI_HOME

echo
echo "= Backup database ="
TOFILE="${BKP_PATH}/${DATE}/bkp_"`basename "${DB_PATH}"`"_"${DATE}".tgz"
tar -czf "${TOFILE}" "${DB_PATH}" || error_exit "Error, exit" 2

echo
echo "= Backup and refresh logs ="
TOFILE="${BKP_PATH}/${DATE}/bkp_"`basename "${LOG_PATH}"`"_"${DATE}".tgz"
tar -czf "${TOFILE}" "${LOG_PATH}" || error_exit "Error, exit" 3
find "${LOG_PATH}" -type f \( -name \*.log -o -name celery -o -name worker1 -o -name worker1.pid \) -exec rm -f {} \; || error_exit "Error, exit" 4

echo
echo "= Updating the code ="
git fetch --all || error_exit "Error, exit" 5
REMOTE_BRANCH=`git rev-parse --abbrev-ref --symbolic-full-name @{u}` || error_exit "Error, exit" 6
git log --abbrev-commit --format=format:"%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%n%C(bold red)TASK: %C(reset)%b" ..${REMOTE_BRANCH} > "${BKP_PATH}/${DATE}/commits_${DATE}.log" || error_exit "Error, exit" 7
git log --merges --abbrev-commit --format=format:"%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%n%C(bold red)TASK: %C(reset)%b" ..${REMOTE_BRANCH} > "${BKP_PATH}/${DATE}/merges_${DATE}.log" || error_exit "Error, exit" 8
git merge ${REMOTE_BRANCH} || error_exit "Error, exit" 9

echo
echo "= Setting up env ="
source env/bin/activate || error_exit "Error, exit" 10

echo
echo "= Updating requirements ="
pip3 install -U -r api/requirements.txt || error_exit "Error, exit" 11

echo
echo "= Entering in the application folder ="
cd api  || error_exit "Error, exit" 12

echo
echo "= Updating the database structure ="
python manage.py migrate || error_exit "Error, exit" 13

#echo
#echo "= Importing the database data ="
#python manage.py loaddata initial_data.json || error_exit "Error, exit" 14

echo
echo "= Cleaning up the auto-generated static files ="
python manage.py collectstatic --clear --noinput --verbosity 0 || error_exit "Error, exit" 15
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

echo
echo "= Exiting ="
deactivate' && exit 0 || exit $?



# End

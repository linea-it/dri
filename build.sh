#!/bin/sh

# /etc/passwd will use sh
# we want to force the use of bash to have the startup env variables

bash -l -i -c '

function error_exit {
    echo "$@" >&2
    exit "${2:-1}"
}

# Apps para o build
apps=("home" "target" "sky" "products")

echo
echo "= Build Frontend Ext apps ="
cd frontend || error_exit "Error, exit" 1


for i in "${apps[@]}"
do
    cd $i

    echo "= Build app $i"

    sencha app build production || error_exit "Error, exit" 1

    cd ..
done

echo
echo "= Exiting ="
deactivate' && exit 0 || exit 127

# End

#!/bin/bash

# if any of the commands in your code fails for any reason, the entire script fails
set -o errexit
# fail exit if one of your pipe command fails
set -o pipefail
# exits if any of your variables is not set
set -o nounset

# TODO: Adicionar função para testar a conexcão com banco de de dados. 
# No momento a unica função do entrypoint é executar o comando passado como parametro.

exec "$@"
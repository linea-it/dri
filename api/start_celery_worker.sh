#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery Worker"

celery -A dri --workdir /app worker \
  -c 4 \
  -l INFO \
  --logfile="/log/%n%I.log"

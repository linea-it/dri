#!/bin/sh

echo "Executing: git describe --tags ${GIT_COMMIT}"
export GIT_TAG="$(git describe --tags ${GIT_COMMIT})"
echo "TAG: ${GIT_TAG}"

printenv

cat >./src/assets/json/version.json <<EOF
  {
    "tag": "$GIT_TAG",
    "sha": "$GIT_COMMIT",
    "url": "$GIT_URL"
  }
EOF
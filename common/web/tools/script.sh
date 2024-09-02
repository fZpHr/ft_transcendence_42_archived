#!/bin/bash

timeout 5s python3 /usr/src/app/manage.py makemigrations
timeout 5s python3 /usr/src/app/manage.py migrate
exec "$@"
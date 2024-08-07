#!/bin/bash

timeout 5s python3 manage.py makemigrations
timeout 5s python3 manage.py migrate
exec "$@"
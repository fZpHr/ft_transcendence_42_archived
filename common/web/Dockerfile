FROM python:3.11-slim-buster

RUN pip install --upgrade pip
COPY ./tools/. .
RUN pip install -r requirements.txt

COPY conf/. .

ENTRYPOINT ["bash"]
CMD ["script.sh", "python3", "/usr/src/app/manage.py", "runserver", "0.0.0.0:8000"]

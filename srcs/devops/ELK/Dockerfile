FROM debian:bullseye

COPY /conf/timesyncd.conf /etc/systemd/timesyncd.conf
COPY /tools/script.sh .

RUN chmod +x script.sh

CMD ["./script.sh"]
FROM debian:bullseye

RUN apt-get update && apt-get install -y && rm -rf /var/lib/apt/lists/*

RUN apt-get -y --no-install-recommends install tzdata && ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime && echo "Europe/Paris" > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

COPY /conf/portainer-2.19.5-linux-amd64.tar.gz /tmp/
RUN tar -xvf /tmp/portainer-2.19.5-linux-amd64.tar.gz -C /usr/local/bin/ && chmod +x /usr/local/bin/portainer/portainer

CMD ["/usr/local/bin/portainer/portainer"]
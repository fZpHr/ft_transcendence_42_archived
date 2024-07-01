#!/bin/bash
set -e

# Mettre à jour les paquets et installer systemd et systemd-timesyncd
apt-get update && apt-get install -y systemd systemd-timesyncd

# Activer systemd-timesyncd
systemctl enable systemd-timesyncd

apt install -y openjdk-11-jdk

# Vérifier si JAVA_HOME est déjà défini dans /etc/environment
if grep -q "JAVA_HOME" /etc/environment; then
    echo "JAVA_HOME is already set"
else
    # Ajouter JAVA_HOME à /etc/environment de manière persistante
    echo "JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64" >> /etc/environment
    # Exporter JAVA_HOME pour la session courante
    export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
    export PATH=$PATH:$JAVA_HOME/bin
fi

#-------------- Installation de Elasticsearch --------------

# Installation de curl et gnupg
apt install curl
apt install gnupg

# Importer la clé de signature de la clé publique Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

# Ajouter le référentiel Elasticsearch à la liste des sources APT
apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list

# Mettre à jour la liste des paquets et installer Elasticsearch
apt-get update && sudo apt-get install elasticsearch

# Activer le service Elasticsearch au démarrage
systemctl enable elasticsearch.service

# Démarrer le service Elasticsearch, si le démarrage échoue, augmenter le délai de démarrage
if systemctl start elasticsearch.service; then
    echo "Elasticsearch service started successfully"
else
    echo "Failed to start Elasticsearch service"
    mkdir /etc/systemd/system/elasticsearch.service.d echo -e "[Service]\nTimeoutStartSec=180"
    tee /etc/systemd/system/elasticsearch.service.d/startup- timeout.conf
    systemctl daemon-reload
fi

#-------------- Installation de Logstash --------------

apt-get update && sudo apt-get install logstash

systemctl enable logstash.service

if systemctl start logstash.service; then
    echo "Logstash service started successfully"
else
    echo "Failed to start Logstash service"
fi

#-------------- Installation de Kibana --------------


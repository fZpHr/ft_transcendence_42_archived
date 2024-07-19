# Utiliser une image de base Nginx avec ModSecurity
FROM elisiano/nginx-modsecurity

# Copier les fichiers de configuration de ModSecurity dans le conteneur
COPY ./modsecurity/owasp-crs /etc/nginx/modsecurity.d/owasp-crs

# Configurer les permissions nécessaires pour le répertoire de ModSecurity
RUN mkdir -p /etc/nginx/modsecurity.d
COPY ./modsecurity/modsecurity.conf /etc/nginx/modsecurity.d/modsecurity.conf
COPY ./modsecurity/includes.conf /etc/nginx/modsecurity.d/includes.conf
RUN chown -R nginx:nginx /etc/nginx/modsecurity.d

RUN mkdir /var/log/modsecurity

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]

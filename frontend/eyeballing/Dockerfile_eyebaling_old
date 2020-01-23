FROM node:8.10 as builder
COPY . /src/app
WORKDIR /src/app
RUN yarn -v
RUN yarn --ignore-optional
RUN yarn run build
FROM nginx:latest
RUN chgrp nginx /var/cache/nginx/
RUN chmod -R g+w /var/cache/nginx/
RUN sed --regexp-extended --in-place=.bak 's%^pid\s+/var/run/nginx.pid;%pid /var/tmp/nginx.pid;%' /etc/nginx/nginx.conf
COPY --from=builder /src/app/build /var/www/frontend
RUN chgrp nginx /var/www/frontend
RUN chmod -R g+w /var/www/frontend
COPY nginx-proxy.conf /etc/nginx/conf.d/default.conf



# RUNTIME ENV
COPY env.sh /var/www/frontend
COPY .env /var/www/frontend
RUN chmod +x /var/www/frontend/env.sh
WORKDIR /var/www/frontend

# Start Nginx server recreating env-config.js
CMD ["/bin/bash", "-c", "/var/www/frontend/env.sh && nginx -g \"daemon off;\""]

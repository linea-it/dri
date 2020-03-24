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
COPY --from=builder /src/app/build /var/www
RUN chgrp nginx /var/www
RUN chmod -R g+w /var/www
COPY nginx-proxy.conf /etc/nginx/conf.d/default.conf

# RUNTIME ENV
WORKDIR /var/www

# Start Nginx server recreating env-config.js
ENTRYPOINT ["nginx","-g","daemon off;"]
# Build Sencha ExtJS Apps
FROM linea/sencha_cmd:6.5.3.6 as sencha_apps

COPY ./ext /code/ext
COPY ./.sencha /code/.sencha
COPY ./workspace.json /code/workspace.json
COPY ./packages /code/packages


# Build Sky
COPY ./sky /code/sky
WORKDIR /code/sky
RUN /opt/Sencha/sencha app build production
RUN cp -r /code/packages/local/visiomatic/src/visiomatic/dist /code/build/production/Sky/packages/local/visiomatic/src/visiomatic/

# Build Target
COPY ./target /code/target
WORKDIR /code/target
RUN /opt/Sencha/sencha app build production
RUN cp -r /code/packages/local/visiomatic/src/visiomatic/dist /code/build/production/Target/packages/local/visiomatic/src/visiomatic/

# Build Explorer
COPY ./explorer /code/explorer
WORKDIR /code/explorer
RUN /opt/Sencha/sencha app build production
RUN cp -r /code/packages/local/visiomatic/src/visiomatic/dist /code/build/production/Explorer/packages/local/visiomatic/src/visiomatic/

# Build Userquery
COPY ./userquery /code/userquery
WORKDIR /code/userquery
RUN /opt/Sencha/sencha app build production

# Build ReactJS Apps
FROM node:10-alpine as react_apps
WORKDIR /app
COPY ./eyeballing .
# RUN yarn -v && yarn --ignore-optional
RUN yarn -v && yarn 
RUN yarn run build


# Nginx
FROM nginx:latest

# Make /var/cache/nginx/ writable by non-root users
RUN chgrp nginx /var/cache/nginx/
RUN chmod -R g+w /var/cache/nginx/

# Run as port 7070, which is available to non-root users allows us to drop
# all remaining root capabilities from the container, which improves security.
# ADD nginx-proxy.conf /etc/nginx/conf.d/default.conf
RUN sed --regexp-extended --in-place=.bak 's%(^\s+listen\s+)80(;)%\17070\2%' /etc/nginx/conf.d/default.conf
EXPOSE 7070

# Write the PID file to a location where regular users have write access.
RUN sed --regexp-extended --in-place=.bak 's%^pid\s+/var/run/nginx.pid;%pid /var/tmp/nginx.pid;%' /etc/nginx/nginx.conf

# Add Extjs Builded apps to image (sky, Target, Explorer, User Query)
COPY --from=sencha_apps /code/build/production /var/www/

# Add eyeballing React App to image
COPY --from=react_apps /app/build /var/www/eyeballing

USER nginx
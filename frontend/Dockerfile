# Build Sencha ExtJS Apps
FROM linea/sencha_cmd:6.5.3.6 AS sencha_apps

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

# Build ReactJS Apps
FROM node:18-alpine AS eyeballing
WORKDIR /app
COPY ./eyeballing .
RUN yarn -v && yarn 
RUN yarn run build

FROM node:18-alpine AS landingpage
WORKDIR /app
COPY ./landing_page .
RUN yarn -v && yarn 
RUN yarn run build


# Nginx
FROM nginx:1.15-alpine

# Add Extjs Builded apps to image (sky, Target, Explorer, User Query)
COPY --from=sencha_apps /code/build/production /var/www/

# Add eyeballing React App to image
COPY --from=eyeballing /app/build /var/www/eyeballing

# Add Landing Page React App to image
COPY --from=landingpage /app/build /var/www/landing_page

# Add Directory where google analytics scripts are located
COPY ./ga /var/www/ga

# Add Directory with images (logo, favicon, etc...)
COPY ./images /var/www/images
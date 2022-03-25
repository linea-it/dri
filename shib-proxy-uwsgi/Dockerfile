FROM gidlab/shib-sp:1.0.2

RUN apt-get install -qq -y libapache2-mod-proxy-uwsgi
RUN /usr/sbin/a2enmod proxy_uwsgi

ENTRYPOINT ["shib_entrypoint"]

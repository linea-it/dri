FROM  grahamdumpleton/mod-wsgi-docker:python-3.4

WORKDIR /app
ADD . /app

RUN cp -R instantclient_12_2/ /opt/

ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
ENV ORACLE_HOME /opt/instantclient_12_2
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME
ENV LD_RUN_PATH=$LD_RUN_PATH:$ORACLE_HOME
RUN ldconfig

RUN pip install -r api/requirements.txt
RUN pip install cx_oracle


RUN apt-get update
RUN apt-get install -y apache2
RUN apt-get install -y python3-pip
RUN apt-get install -y libapache2-mod-wsgi-py3
RUN apt-get install -y python-virtualenv
RUN apt-get install -y libaio1
RUN apt install -y virtualenv
RUN cp dri.conf /etc/apache2/sites-available/

env APACHE_RUN_USER    www-data
env APACHE_RUN_GROUP   www-data
env APACHE_PID_FILE    /var/run/apache2.pid
env APACHE_RUN_DIR     /var/run/apache2
env APACHE_LOCK_DIR    /var/lock/apache2
env APACHE_LOG_DIR     /var/log/apache2
env LANG               C

RUN a2ensite dri.conf
RUN chown -R www-data:www-data db
EXPOSE 80

RUN apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]

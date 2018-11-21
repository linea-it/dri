FROM python:3.6.4
RUN apt-get update
RUN add-apt-repository universe
RUN apt-get install alien
ENV PYTHONUNBUFFERED 1
RUN mkdir /app
WORKDIR /app
ADD requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
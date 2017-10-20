from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^vizier/2mass', views.vizier_2mass),
]
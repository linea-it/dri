import logging

import django_filters
from rest_framework import filters
from rest_framework import viewsets
from rest_framework import mixins
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.db.models import * 
from common.filters import IsOwnerFilterBackend
from .models import UserQuery
from .serializers import *
from django.contrib.auth.models import User

from .filters import UserQueryPermissionFilterBackend
import operator

logger = logging.getLogger(__name__)

class UserQueryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = UserQuery.objects.select_related().all()

    serializer_class = UserQuerySerializer

    search_fields = ('name', 'query')

    filter_backends = (filters.DjangoFilterBackend,)

    ordering_fields = ('id', 'name')

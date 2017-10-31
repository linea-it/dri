import logging
from .serializers import *
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from .permissions import IsOwnerOrPublic


logger = logging.getLogger(__name__)


class UserQueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = UserQuerySerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

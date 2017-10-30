import logging
from .serializers import *
from rest_framework import viewsets

logger = logging.getLogger(__name__)


class UserQueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = UserQuerySerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

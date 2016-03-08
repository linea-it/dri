from django.shortcuts import render
from coadd.models import Release
from rest_framework import viewsets
from coadd.serializers import ReleaseSerializer

# Create your views here.
class ReleaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    queryset = Release.objects.all()

    serializer_class = ReleaseSerializer
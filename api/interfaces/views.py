from rest_framework import viewsets
from .models import Application 
from .serializers import ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):

    queryset = Application.objects.all()

    serializer_class = ApplicationSerializer

    search_fields = ('app_name')

    filter_fields = ('id', 'app_name')

    ordering_fields = ('id', 'app_name')

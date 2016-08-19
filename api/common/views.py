# Create your views here.
from requests import Response

from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.mixins import RetrieveModelMixin
from django.contrib.auth.models import User
from .models import Filter
from .serializers import FilterSerializer, UserSerializer

class FilterViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows filters to be viewed or edited
    """

    queryset = Filter.objects.all()

    serializer_class = FilterSerializer

    filter_fields = ('project', 'filter',)

    ordering_fields = ('lambda_min', 'lambda_max', 'lambda_mean',)


# class CurrentUserViewSet(viewsets.ViewSet):
#     # queryset = User.objects.all()
#     # serializer_class = UserSerializer
#     def get(self, request):
#         print("------- TESTE -----------")
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)

class LoggedUserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    model = User
    serializer_class = UserSerializer

    def get_object(self):
        # return self.request.user.is_authenticated()
        return self.request.user

    def get_queryset(self):

        users = [self.request.user]
        return users

    def get_logged(self):
        return self.request.user



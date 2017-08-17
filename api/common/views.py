# Create your views here.
from requests import Response
from smtplib import SMTPException

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Filter
from .serializers import FilterSerializer, UserSerializer
from django.core.mail import send_mail
from django.http import HttpResponse
from django.conf import settings
from rest_framework import status
import django_filters
from rest_framework import filters


class FilterViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows filters to be viewed or edited
    """

    queryset = Filter.objects.all()

    serializer_class = FilterSerializer

    filter_fields = ('project', 'filter',)

    ordering_fields = ('lambda_min', 'lambda_max', 'lambda_mean',)


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


# class UsersFilter(django_filters.FilterSet):
#     group = django_filters.MethodFilter()
#
#     class Meta:
#         model = User
#         fields = ['group',]
#
#     def filter_group(self, queryset, value):
#         if value:
#             groups = self.request.user.groups.all()
#             return queryset.filter(groups__in=groups)

class UsersSameGroupFilterBackend(filters.BaseFilterBackend):
    """
        Retornar os Usuarios que estao no mesmo User Group que o usuario logado.
    """

    def filter_queryset(self, request, queryset, view):
        groups = request.user.groups.all()
        return queryset.filter(groups__in=groups).exclude(pk=request.user.pk)


class UsersInSameGroupViewSet(viewsets.ModelViewSet):
    """
    Retorna a lista de usuarios do mesmo grupo
    """
    queryset = User.objects.filter()
    model = User
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend, UsersSameGroupFilterBackend)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def contact_us(request):
    """
        API Endpoint to send a email to helpdesk
    Args:
        request:

    Returns:

    """
    if request.method == 'POST':

        # Dados da Mensagem
        name = request.data.get('name', None)
        from_email = request.data.get('from', None)
        subject = request.data.get('subject', None)
        message = request.data.get('message', None)

        # Dados Tecnicos
        current_url = request.data.get('current_url', None)
        current_user = request.data.get('current_user', None)

        if name is not None and from_email is not None and subject is not None and message is not None:

            to_email = settings.EMAIL_HELPDESK

            try:
                send_mail(
                    subject,
                    message,
                    from_email,
                    [to_email],
                    fail_silently=False,
                )

                return Response({"message": "Message sent successfully!"})

            except SMTPException as e:
                return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_providers():
    from allauth.socialaccount.providers import registry
    from allauth.socialaccount.models import SocialApp
    from allauth.socialaccount.providers.oauth.provider import OAuthProvider
    from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider
    from django.contrib.sites.models import Site

    site = Site.objects.get_current()
    result = []
    for provider in registry.get_list():
        if (isinstance(provider, OAuth2Provider)
                or isinstance(provider, OAuthProvider)):
            try:
                app = SocialApp.objects.get(provider=provider.id,
                                      sites=site)
                result.append(str(app.provider))
            except SocialApp.DoesNotExist:
                app2 = ''
    return str(result)


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        print('Teste---------------------')

        # from product.tasks import start_des_cutout_job_by_id
        # from pprint import pprint

        # result = start_des_cutout_job_by_id.delay(37)
        # pprint(result)
        # from product.descutoutservice import DesCutoutService, CutoutJobNotify
        # cutoutjobs = DesCutoutService()
        # cutoutjob = cutoutjobs.get_cutoutjobs_by_id(68)
        # teste = CutoutJobNotify().create_email_message(cutoutjob)
        # a = cutoutjobs.start_job_by_id(46)
        # a = cutoutjobs.check_jobs()
        # a = cutoutjobs.start_job()
        # a = cutoutjobs.test_api_help()

        return Response(dict({'teste': ''}))

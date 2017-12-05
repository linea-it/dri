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
from rest_framework.authtoken.models import Token
from django.conf import settings


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
        user_email = request.data.get('from', None)
        subject = "[DRI] %s" % request.data.get('subject', None)
        message = request.data.get('message', None)

        # Dados Tecnicos
        current_url = request.data.get('current_url', None)
        current_user = request.data.get('current_user', None)

        if name is not None and user_email is not None and subject is not None and message is not None:
            try:
                to_email = settings.EMAIL_HELPDESK
                from_email = settings.EMAIL_HELPDESK_CONTACT

                message_header = (
                    "Name: %s\nUsername: %s\nEmail: %s\nMessage:\n" % (name, request.user.username, user_email))

                body = message_header + message

                send_mail(
                    subject,
                    body,
                    from_email,
                    [to_email],
                    fail_silently=False,
                )

                return Response({"message": "Message sent successfully!"})

            except SMTPException as e:
                return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_providers():
    try:
        # [Glauber] 06/09/2017
        # Esses imports NAO podem ocorrer se a aplicacao estiver configurada
        # para nao usar OAUTH. (settings.degaults USE_OAUTH: boolean)
        # Esses imports geram erro na instalacao da aplicacao quando ainda
        # nao existem as tabelas e o comando migrate nao consegue executar
        # por que esses imports tentam acessar uma tabela que nao existe.
        # TODO: Checar qual o impacto desse bloco nao ser executado.
        if settings.USE_OAUTH:
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
    except:
        pass


@api_view(['GET'])
def get_token(request):
    if request.method == 'GET':
        try:
            token = Token.objects.get(user=request.user)
        except:
            token = Token.objects.create(user=request.user)
        return Response(dict({'token': token.key}))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_setting(request):
    if request.method == 'GET':

        not_available = list([
            'DATABASES',
            'BASE_PROJECT',
            'LOGGING',
            'AUTHENTICATION_BACKENDS',
            'AUTH_PASSWORD_VALIDATORS',
            'DATABASE_ROUTERS',
            'ALLOWED_HOSTS',
            'SECRET_KEY',
            'INSTALLED_APPS',
            'REST_FRAMEWORK',
            'SOCIALACCOUNT_PROVIDERS',
            'CELERY_BROKER_URL'
        ])

        name = request.GET.get("name", None)
        names = request.GET.get("names", None)

        if name is None and names is None:
            raise Exception("is necessary the name parameter with the identifier of the variable in the settings")


        if name is not None:

            data = {}

            # Somente permitir variaveis que nao contenham dados sensiveis como senha por exemplo
            if name not in not_available:

                try:
                    value = settings.__getattr__(name)

                    data[name] = value

                except:
                    return Response(dict({"msg": "this variable \"%s\" not found" % name}), status=500)

            else:
                return Response(dict({"msg": "this variable \"%s\" not available" % name}), status=500)

        elif name is None and names is not None:
            names = names.split(',')
            data = {}

            for name in names:

                # Somente permitir variaveis que nao contenham dados sensiveis como senha por exemplo
                if name not in not_available:

                    try:
                        value = settings.__getattr__(name)

                        data[name] = value

                    except:
                        return Response(dict({"msg": "this variable \"%s\" not found" % name}), status=500)

                else:
                    return Response(dict({"msg": "this variable \"%s\" not available" % name}), status=500)


        return Response(data)

@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        # from activity_statistic.reports import ActivityReports
        # import datetime
        #
        # yesterday = datetime.date.today() - datetime.timedelta(days=1)
        #
        # # ActivityReports().get_all_visits_consolidate_by_month()
        #
        # ActivityReports().report_email_unique_visits(yesterday)

        #
        # visits = ActivityReports().unique_visits_by_date(year=yesterday.year, month=yesterday.month, day=yesterday.day)
        # return Response(dict({'data': visits}))


        return Response(dict({'status': "success"}))

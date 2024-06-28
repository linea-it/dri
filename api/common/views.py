# Create your views here.
from requests import Response
from smtplib import SMTPException

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
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
import requests
from urllib.parse import urljoin
from django_filters.rest_framework import DjangoFilterBackend


class FilterViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows filters to be viewed or edited
    """

    queryset = Filter.objects.all()

    serializer_class = FilterSerializer

    filterset_fields = (
        "project",
        "filter",
    )

    ordering_fields = (
        "lambda_min",
        "lambda_max",
        "lambda_mean",
    )


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
    filter_backends = (DjangoFilterBackend, UsersSameGroupFilterBackend)


@api_view(["POST"])
@permission_classes([AllowAny])
def contact_us(request):
    """
        API Endpoint to send a email to helpdesk
    Args:
        request:

    Returns:

    """
    if request.method == "POST":

        try:
            environment = settings.ENVIRONMENT_NAME
        except:
            raise Exception(
                "The ENVIRONMENT_NAME variable is not configured in settings."
            )

        # Dados da Mensagem
        name = request.data.get("name", None)
        user_email = request.data.get("from", None)
        subject = "[DRI][%s] %s" % (environment, request.data.get("subject", None))
        message = request.data.get("message", None)

        if user_email is None:
            try:
                user_email = request.user.email
            except:
                user_email = None

        if (
            name != None
            and user_email != None
            and subject != None
            and message != None
        ):
            try:
                to_email = settings.EMAIL_HELPDESK
                from_email = user_email

                message_header = "Name: %s\nUsername: %s\nEmail: %s\nMessage:\n" % (
                    name,
                    request.user.username,
                    user_email,
                )

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
                if isinstance(provider, OAuth2Provider) or isinstance(
                    provider, OAuthProvider
                ):
                    try:
                        app = SocialApp.objects.get(provider=provider.id, sites=site)
                        result.append(str(app.provider))
                    except SocialApp.DoesNotExist:
                        app2 = ""
            return str(result)
    except:
        pass


# @api_view(["GET", "POST"])
@api_view(["POST"])
def get_token(request):
    # if request.method == "GET":
    #     # TODO: Este metodo Aparentemente não é utilizado
    #     # Recomendado que seja removido já o acesso aos tokens deveriam ser feitos somente pelo
    #     # endpoint obtain-auth-token
    #     try:
    #         token = Token.objects.get(user=request.user)
    #     except:
    #         token = Token.objects.create(user=request.user)
    #     return Response(dict({"token": token.key}))
    if request.method == "POST":
        """_Cria um novo token para o usuario logado.

            Este metodo é utilizado pela interface API Token no menu de usuario dos apps
            Sempre que este metodo for executado um novo token sera criado,
            Caso o usuario já possua um token ele será removido e um novo será criado.

        Returns:
            dict: {token: str}
        """
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
            token = Token.objects.create(user=request.user)
        except:
            token = Token.objects.create(user=request.user)
        return Response(dict({"token": token.key}))


@api_view(["GET"])
@permission_classes([AllowAny])
def get_setting(request):
    if request.method == "GET":

        not_available = list(
            [
                "DATABASES",
                "BASE_PROJECT",
                "LOGGING",
                "AUTHENTICATION_BACKENDS",
                "AUTH_PASSWORD_VALIDATORS",
                "DATABASE_ROUTERS",
                "ALLOWED_HOSTS",
                "SECRET_KEY",
                "INSTALLED_APPS",
                "REST_FRAMEWORK",
                "SOCIALACCOUNT_PROVIDERS",
                "CELERY_BROKER_URL",
                "DESACCESS_API",
            ]
        )

        name = request.GET.get("name", None)
        names = request.GET.get("names", None)

        if name is None and names is None:
            raise Exception(
                "is necessary the name parameter with the identifier of the variable in the settings"
            )

        if name != None:

            data = {}

            # Somente permitir variaveis que nao contenham dados sensiveis como senha por exemplo
            if name not in not_available:

                try:
                    value = settings.__getattr__(name)

                    data[name] = value

                except:
                    return Response(
                        dict({"msg": 'this variable "%s" not found' % name}), status=500
                    )

            else:
                return Response(
                    dict({"msg": 'this variable "%s" not available' % name}), status=500
                )

        elif name is None and names != None:
            names = names.split(",")
            data = {}
            key = None

            for name in names:
                orinal_name = name
                if name.find("__") > -1:
                    arr = name.split("__")
                    key = arr[0]
                    name = arr[1].replace("__", "")

                # Somente permitir variaveis que nao contenham dados sensiveis como senha por exemplo
                if name not in not_available:

                    try:
                        if key is None:
                            value = settings.__getattr__(name)

                        else:
                            value = settings.__getattr__(key)[name]

                        data[orinal_name] = value

                    except:
                        return Response(
                            dict({"msg": 'this variable "%s" not found' % orinal_name}),
                            status=500,
                        )

                else:
                    return Response(
                        dict({"msg": 'this variable "%s" not available' % orinal_name}),
                        status=500,
                    )

        return Response(data)


@api_view(["GET"])
def send_statistic_email(request):
    """
    Este metodo e usado para enviar o email de estatistica a qualquer momento.
    independente da task diaria.
    :param request:
    :return:
    """
    if request.method == "GET":
        from activity_statistic.reports import ActivityReports
        import datetime

        try:
            ActivityReports().report_email_unique_visits(datetime.date.today())
            return Response(dict({"status": "success"}))

        except Exception as e:

            return Response(dict({"status": "failure", "Exception": str(e)}))


@api_view(["GET"])
def galaxy_cluster(request):
    if request.method == "GET":
        clusterSource = request.GET.get("clusterSource", None)
        clusterId = request.GET.get("clusterId", None)
        vacSource = request.GET.get("vacSource", None)
        lon = request.GET.get("lon", None)
        lat = request.GET.get("lat", None)
        radius = request.GET.get("radius", None)

        try:
            host = settings.PLUGIN_GALAXY_CLUSTER_HOST
        except:
            raise Exception(
                "The PLUGIN_GALAXY_CLUSTER_HOST variable is not configured in settings."
            )

        params = (
            "density_map?clusterSource=%s&clusterId=%s&vacSource=%s&lon=%s&lat=%s&radius=%s"
            % (clusterSource, clusterId, vacSource, lon, lat, radius)
        )

        url = urljoin(host, params)

        r = requests.get(url, timeout=160)

        if r.status_code == 200:
            print(r.json())
            return Response(r.json())
        else:

            print(r.text)
            try:
                return Response(r.json())
            except:
                return Response(dict({"success": False}))


@api_view(["GET"])
def available_database(request):
    """
    Retorna os databases configurados como sendo DBs de Catalogo.
    não inclui o database administrativo.
    """
    if request.method == "GET":
        dbs = list([])

        # TODO: é provavel que ao adicionar mais bancos de dados, o target viewer de
        # problema com as tabelas de rating e reject
        for db in settings.DATABASES:
            if db != "default" and db in settings.TARGET_VIEWER_DATABASES:
                try:
                    dbs.append(
                        dict(
                            {
                                "name": db,
                                "display_name": settings.DATABASES[db]["DISPLAY_NAME"],
                            }
                        )
                    )
                except:
                    dbs.append(dict({"name": db, "display_name": db}))

        return Response(dict({"results": dbs, "count": len(dbs)}))


@api_view(["GET"])
@permission_classes([AllowAny])
def get_ncsa_signup(request):
    """Returns the URL of the NCSA registration page.
    this url is stored in the settings.NCSA_SIGNUP_LINK has a default value of None,
    but for the public NCSA environment the value is a complete url
    like this: 'https://des.ncsa.illinois.edu/easyweb/signup/'


    Returns:
        dict: A dictionary with the ncsa_signup attribute with the url string or None.
    """
    if request.method == "GET":
        return Response(dict({"ncsa_signup": settings.NCSA_SIGNUP_LINK}))


@api_view(["GET"])
def teste(request):
    if request.method == "GET":
        return Response(dict({"status": "success"}))

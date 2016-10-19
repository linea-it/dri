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


@api_view(['GET'])
def teste(request):

    if request.method == 'GET':
        print('Teste---------------------')
        from product.CutoutJobs import CutoutJobs
        a = CutoutJobs.start_job([350.76500] , [-0.45300], 'coadd')
        print(a)



        return Response(dict({'teste':''}))
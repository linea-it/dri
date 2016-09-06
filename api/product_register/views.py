from django.db import transaction
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from .ImportProcess import Import
from .models import ExternalProcess, Site, Authorization
from .serializers import ExternalProcessSerializer, SiteSerializer, AuthorizationSerializer



class SiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Sites to be viewed or edited
    """

    queryset = Site.objects.select_related().all()

    serializer_class = SiteSerializer

    search_fields = ('sti_user', 'sti_name', 'sti_url',)

    filter_fields = ('id', 'sti_user', 'sti_name')

    ordering_fields = ('id',)


class ExternalProcessViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Processes to be viewed or edited
    """

    queryset = ExternalProcess.objects.select_related().all()

    serializer_class = ExternalProcessSerializer

    search_fields = ('epr_name', 'epr_username', 'epr_readme', 'epr_comment', 'epr_original_id')

    filter_fields = ('id', 'epr_name', 'epr_original_id')

    ordering_fields = ('id', 'epr_original_id', 'epr_site')


class AuthorizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Authorization to be viewed or edited
    """
    authentication_classes = (SessionAuthentication, BasicAuthentication, )

    queryset = Authorization.objects.select_related().all()

    serializer_class = AuthorizationSerializer

    search_fields = ('ath_ticket', )

    filter_fields = ('ath_ticket', )

    ordering_fields = ('id',)


    def perform_create(self, serializer):
        serializer.save(ath_owner=self.request.user)


class ExternalProcessImportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Processes to be imported
    """
    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)

    permission_classes = (IsAuthenticated,)

    serializer_class = ExternalProcessSerializer

    @transaction.atomic
    def create(self, request):

        response = Import().start_import(request)

        if response is not None and response.data.get('id') > 0:
            return response
        else:
            raise Exception('was a failure to create the record.')


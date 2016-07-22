from lib.ImportProcess import ImportProcessProduct

from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
from .models import ExternalProcess
from .serializers import ExternalProcessSerializer


# Create your views here.

class ExternalProcessViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Processes to be viewed or edited
    """
    queryset = ExternalProcess.objects.select_related().all()

    serializer_class = ExternalProcessSerializer

    search_fields = ('epr_name', 'epr_username', 'epr_readme', 'epr_comment', 'epr_original_id')

    filter_fields = ('id', 'epr_name', 'epr_original_id')

    ordering_fields = ('id', 'epr_original_id', 'epr_site')


class ExternalProcessImportViewSet(ViewSet):
    def create(self, request):
        print('-------------------- Teste ---------------------')
        print(request.data)
        ImportProcessProduct(request.data)
        pass

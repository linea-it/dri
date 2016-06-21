from rest_framework import viewsets
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

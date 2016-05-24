# Create your views here.
from rest_framework import viewsets
from .models import Filter
from .serializers import FilterSerializer

class FilterViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows filters to be viewed or edited
    """

    queryset = Filter.objects.all()

    serializer_class = FilterSerializer

    filter_fields = '__all__'

    ordering_fields = '__all__'
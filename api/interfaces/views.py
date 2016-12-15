from rest_framework import viewsets
from .models import Application, Tutorial
from .serializers import ApplicationSerializer, TutorialSerializer
from rest_framework.permissions import AllowAny
import django_filters
from rest_framework import filters

class ApplicationViewSet(viewsets.ModelViewSet):

    queryset = Application.objects.all()

    permission_classes = (AllowAny,)

    serializer_class = ApplicationSerializer

    search_fields = ('app_name')

    filter_fields = ('id', 'app_name')

    ordering_fields = ('id', 'app_name')


class TutorialFilter(django_filters.FilterSet):
    app_name = django_filters.MethodFilter()

    class Meta:
        model = Tutorial
        fields = ('id', 'app_name', 'ttr_title', 'ttr_description',)

    def filter_app_name(self, queryset, value):
        return queryset.filter(application__app_name=str(value))


class TutorialViewSet(viewsets.ModelViewSet):

    queryset = Tutorial.objects.all()

    permission_classes = (AllowAny,)

    serializer_class = TutorialSerializer

    search_fields = ('ttr_title', 'ttr_description')

    filter_backends = (filters.DjangoFilterBackend,)

    filter_class = TutorialFilter

    ordering_fields = ('id', 'ttr_title')
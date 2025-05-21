from rest_framework import viewsets
from .models import Application, Tutorial
from .serializers import ApplicationSerializer, TutorialSerializer
from rest_framework.permissions import AllowAny
import django_filters
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Application.objects.all()

    permission_classes = (AllowAny,)

    serializer_class = ApplicationSerializer

    search_fields = ('app_name')

    filterset_fields = ('id', 'app_name')

    ordering_fields = ('id', 'app_name', 'app_order')


class TutorialFilter(django_filters.FilterSet):
    app_name = django_filters.CharFilter(method='filter_app_name')

    class Meta:
        model = Tutorial
        fields = ('id', 'app_name', 'ttr_title', 'ttr_description',)

    def filter_app_name(self, queryset, name, value):
        return queryset.filter(application__app_name=str(value))


class TutorialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tutorial.objects.all()

    permission_classes = (AllowAny,)

    serializer_class = TutorialSerializer

    search_fields = ('ttr_title', 'ttr_description')

    filter_backends = (DjangoFilterBackend,)

    filterset_class = TutorialFilter

    ordering_fields = ('id', 'ttr_title')

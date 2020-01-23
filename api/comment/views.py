import django_filters
import json
from rest_framework import viewsets
from rest_framework import filters
from .models import Position, Dataset
from .serializers import PositionSerializer, CommentDatasetSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django_filters.rest_framework import OrderingFilter


class PositionFilter(django_filters.FilterSet):
    coordinates = django_filters.CharFilter(method='filter_coordinates')

    class Meta:
        model = Position
        fields = ['id', 'owner', 'pst_dataset', 'pst_ra', 'pst_dec', 'pst_date', 'pst_comment']

    def filter_coordinates(self, queryset, name, value):

        corners = json.loads(value)

        if len(corners) != 2 or len(corners[0]) != 2 or len(corners[1]) != 2:
            raise Exception(
                'Invalid format for coordinates. Expected value is an array of two arrays, each one with two items (RA,Dec).'
                '\nExpected format must contains the lower-left and the upper-right positions.'
                '\nExample: \'[[314.635648,-35.320833],[315.506761,-34.606944]]\'.'
                '\nNote: remember to encode the URL (the previous string became \'%5B%5B314.635648%2C-35.320833%5D%2C%5B315.506761%2C-34.606944%5D%5D\').')

        rall = float(corners[0][0])
        decll = float(corners[0][1])
        raur = float(corners[1][0])
        decur = float(corners[1][1])

        q = queryset.filter(
            pst_ra__gte=rall,
            pst_ra__lte=raur,
            pst_dec__gte=decll,
            pst_dec__lte=decur,
        )

        return q


class PositionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Comment by Position to be viewed or edited
    """
    queryset = Position.objects.all()

    serializer_class = PositionSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = PositionFilter

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)


class CommentDatasetFilter(django_filters.FilterSet):
    release = django_filters.CharFilter(method='filter_release')

    class Meta:
        model = Dataset
        fields = ['id', 'dts_dataset', 'dts_comment', 'release', 'dts_type']
        order_by = True

    def filter_release(self, queryset, name, value):
        return queryset.filter(dts_dataset__tag__tag_release__id=int(value))


class CommentDatasetViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Comment by Dataset to be viewed or edited
    """
    queryset = Dataset.objects.all()
    serializer_class = CommentDatasetSerializer

    filter_backends = (DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter)

    filter_class = CommentDatasetFilter

    ordering_fields = ('dts_date', 'dts_dataset__tile__tli_tilename', 'dts_dataset__inspected__isp_value', 'owner__username', 'dts_comment' )

    search_fields = ('dts_comment', 'dts_dataset__tile__tli_tilename', 'owner__username',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception(
                'It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)

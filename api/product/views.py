import logging

from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

logger = logging.getLogger(__name__)


# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows product to be viewed or edited
    """
    queryset = Product.objects.select_related().all()

    serializer_class = ProductSerializer

    search_fields = ('prd_name', 'prd_display_name', 'prd_class')

    filter_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')

    ordering_fields = ('id', 'prd_name', 'prd_display_name', 'prd_class')

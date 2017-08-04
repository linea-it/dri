from rest_framework import serializers
from .models import Image
from product.models import Product


class ImageSerializer(serializers.HyperlinkedModelSerializer):

    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=False)

    class Meta:
        model = Image

        fields = ['id', 'img_url', 'product']

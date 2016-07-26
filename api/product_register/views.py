from requests import Response

# from lib.ImportProcess import ImportProcessProduct
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .models import ExternalProcess, Site
from .serializers import ExternalProcessSerializer, SiteSerializer
from django.db import transaction
from product.serializers import CatalogSerializer
from product_classifier.models import ProductClass


# Create your views here.

class SiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Sites to be viewed or edited
    """

    queryset = Site.objects.select_related().all()

    serializer_class = SiteSerializer

    search_fields = ('sti_user', 'sti_name', 'sti_url', )

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


class ExternalProcessImportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Processes to be viewed or edited
    """
    authentication_classes = (TokenAuthentication,)

    permission_classes = (IsAuthenticated,)

    serializer_class = ExternalProcessSerializer

    @transaction.atomic
    def create(self, request):
        data = request.data
        user = request.user

        site = Site.objects.get(sti_user=user.pk)

        # TODO: Execoes caso não esteja logado.

        if 'process' in data:
            dprocess = data.get('process')
            process_data = {
                "epr_name": dprocess.get('process_name'),
                "epr_username": dprocess.get('owner_username'),
                "epr_start_date": dprocess.get('process_start_date'),
                "epr_end_date": dprocess.get('process_end_date'),
                "epr_readme": dprocess.get('process_description'),
                "epr_comment": dprocess.get('process_comment'),
                "epr_original_id": dprocess.get('process_id'),
                "epr_site": site.pk
            }

            process_serializer = ExternalProcessSerializer(data=process_data, context={'request': request})
            if process_serializer.is_valid(raise_exception=True):
                process = process_serializer.save()
                print(process.pk)


            if 'products' in dprocess and len(dprocess.get('products')) > 0:
                products = dprocess.get('products')

                for product in products:
                    if product.get('type') == 'catalog':

                        cls = ProductClass.objects.get(pcl_name=product.get('class'))

                        print(cls)
                        catalog_data = {
                            "prd_process_id": process.pk,
                            "prd_name": product.get('name'),
                            "prd_display_name": product.get('display_name'),
                            "prd_flag_removed": False,
                            "prd_class": cls.pk,
                            "ctl_num_columns": 0,
                            "ctl_num_tiles": 0,
                            "ctl_num_objects": 0,
                            "tbl_schema": product.get('scheme'),
                            "tbl_name": product.get('table'),
                        }

                        catalog_serializer = CatalogSerializer(data=catalog_data, context={'request': request})
                        if catalog_serializer.is_valid(raise_exception=True):
                            catalog = catalog_serializer.save()
                            print(catalog.pk)


            else:
                print('SEM PRODUTOS')



    # def perform_create(self, serializer):
    #     if not self.request.user.pk:
    #         raise Exception('It is necessary an active login to perform this operation.')
    #     site = Site.objects.get(sti_user=self.request.user.pk)
    #
    #     print(site)
    #
    #     serializer.save(
    #         epr_site=site
    #     )


# class ExternalProcessImportViewSet(ViewSet):
#     authentication_classes = (TokenAuthentication,)
#     permission_classes = (IsAuthenticated,)
#
#     serializer_class = ExternalProcessSerializer
#
#     def create(self, request):
#         print('-------------------- Teste ---------------------')
#
#         data = request.data
#         user = request.user
#
#         # print(data)
#
#         if 'process' in data:
#             process_data = {
#                 "epr_name": data.get('process').get('process_name'),
#                 "epr_username": data.get('process').get('owner_username'),
#                 "epr_start_date": data.get('process').get('process_start_date'),
#                 "epr_end_date": data.get('process').get('process_end_date'),
#                 "epr_readme": data.get('process').get('process_description'),
#                 "epr_comment": data.get('process').get('process_comment'),
#                 "epr_original_id": data.get('process').get('process_id'),
#                 "epr_site": user.pk
#             }
#             print(process_data)
#             serializer = self.get_serializer(process_data)
#             print(serializer)
#
#         return Response({'success': True})
#
#         # def create(self, request):
#     #     print('-------------------- Teste ---------------------')
#     #     print(request.data)
#     #     # ImportProcessProduct(request.data)
#     #
#     #     return Response({
#     #         'success': True
#     #     })



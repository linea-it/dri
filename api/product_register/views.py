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
from product.serializers import CatalogSerializer, ProductContentSerializer
from product_classifier.models import ProductClass
from lib.CatalogDB import CatalogDB

from rest_framework import status
from rest_framework.response import Response


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


class ExternalProcessImportViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows External Processes to be imported
    """
    authentication_classes = (TokenAuthentication,)

    permission_classes = (IsAuthenticated,)

    serializer_class = ExternalProcessSerializer

    @transaction.atomic
    def create(self, request):
        data = request.data
        user = request.user

        site = Site.objects.get(sti_user=user.pk)
        # TODO: Execoes caso nao esteja logado.
        if not site:
            raise Exception('There is no site associated with this login.')


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

            # Registrar os produtos
            if 'products' in dprocess and len(dprocess.get('products')) > 0:
                products = dprocess.get('products')

                for product in products:
                    if product.get('type') == 'catalog':
                        # Instancia do banco de catalogo
                        con = CatalogDB()
                        db = con.wrapper

                        # Tablename do catalogo
                        if product.get('scheme'):
                            tablename = '%s.%s' % (product.get('scheme'), product.get('table'))
                        else:
                            tablename = product.get('table')

                        # Recuperar as colunas do catalogo.
                        columns = db.get_table_columns(tablename)

                        # Recuperar a quantidade de linhas
                        count = db.get_count(tablename)

                        try:
                            cls = ProductClass.objects.get(pcl_name=product.get('class'))
                        except Exception as error:
                            acls = list()
                            for cls in ProductClass.objects.all():
                                acls.append(cls.pcl_name)
                            raise Exception('It is class is not available. these are available: %s' % (', '.join(acls)))

                        catalog_data = {
                            "prd_process_id": process.pk,
                            "prd_name": product.get('name'),
                            "prd_display_name": product.get('display_name'),
                            "prd_flag_removed": False,
                            "prd_class": cls.pk,
                            "ctl_num_columns": len(columns),
                            "ctl_num_objects": count,
                            "tbl_schema": product.get('scheme'),
                            "tbl_name": product.get('table'),
                        }

                        catalog_serializer = CatalogSerializer(data=catalog_data, context={'request': request})
                        if catalog_serializer.is_valid(raise_exception=True):
                            catalog = catalog_serializer.save()

                        # Registrar as colunas do catalogo na tabela product_content
                        if columns and len(columns) > 0:
                            for column in columns:
                                column_serializer = ProductContentSerializer(data={
                                    'pcn_product_id': catalog.pk,
                                    'pcn_column_name': column
                                }, context={'request': request})

                                if column_serializer.is_valid():
                                    column_serializer.save()

                return Response(
                    data=process_serializer.data,
                    status=status.HTTP_201_CREATED
                )

            else:
                raise Exception('Any product to be imported.')
        else:
            # TODO caso nao seja passado nenhum processo criar um processo so com os campos obrigatorios.
            return Response(
                data={
                    'message': 'It is still not possible to import a product without being associated with a process.'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

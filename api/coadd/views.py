import copy
import os
from urllib.parse import urljoin

import django_filters
from common.models import Filter
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend, OrderingFilter
from lib.sqlalchemy_wrapper import DBBase
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.decorators import action
from rest_framework.response import Response
from pathlib import Path

from .models import Dataset, Release, Survey, Tag, Tile
from .serializers import (
    DatasetFootprintSerializer,
    DatasetSerializer,
    ReleaseSerializer,
    SurveySerializer,
    TagSerializer,
    TileSerializer,
)

from common.desaccess import DesAccessApi
from django.db.models import Q


class ReleaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows releases to be viewed or edited
    """

    # queryset = Release.objects.filter(rls_disabled=False)

    serializer_class = ReleaseSerializer

    search_fields = (
        "rls_name",
        "rls_display_name",
    )

    filterset_fields = (
        "id",
        "rls_name",
        "rls_display_name",
    )

    ordering_fields = "__all__"

    def get_queryset(self):

        # Se o usuario for admin do Django retorna todos os releases Habilitados
        if self.request.user.is_staff:
            return Release.objects.filter(rls_disabled=False)
        else:
            # Retorna os IDs de todos os releases que o usuario tem permissão de acessar.
            perm_releases = self.request.user.get_user_releases()

            # Todos os Releases Publicos + os Releases relacionados aos grupos que o usuario pertence.
            queryset = Release.objects.filter(pk__in=perm_releases)

            return queryset


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited
    """

    queryset = Tag.objects.all()

    serializer_class = TagSerializer

    filterset_fields = (
        "id",
        "tag_release",
        "tag_name",
        "tag_display_name",
        "tag_status",
    )

    ordering_fields = "__all__"


class TileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows tile to be viewed or edited
    """

    queryset = Tile.objects.all()

    serializer_class = TileSerializer

    filterset_fields = (
        "id",
        "tli_tilename",
        "tag",
        "tli_project",
        "tli_ra",
        "tli_dec",
    )

    search_fields = ("tli_tilename",)

    ordering_fields = (
        "tli_tilename",
        "tli_ra",
        "tli_dec",
    )

    @action(detail=True)
    def desaccess_tile_info(self, request, pk=None):
        """Search DESaccess for tilename and return a list of tile files.

        Returns:
            dict: returns a dict with the image and catalog urls.
        """
        tile = self.get_object()

        tilename = tile.tli_tilename

        desapi = DesAccessApi()
        tileinfo = desapi.tile_by_name(tilename)

        return Response(tileinfo)

    @action(detail=False, methods=["post"])
    def desaccess_get_download_url(self, request):
        """creates an authenticated url for a file served by DESaccess.

        Args:
            file_url (str): URL of the file to be downloaded.

        Returns:
            str: Authenticated URL, note that this url has a time limit to be used. must be generated at the time the download is requested.
        """

        params = request.data
        file_url = params["file_url"]

        desapi = DesAccessApi()

        download_url = desapi.file_url_to_download(file_url)

        return Response(dict({"download_url": download_url}))


class DatasetFilter(django_filters.FilterSet):
    tag__in = django_filters.CharFilter(method="filter_tag__in")
    tli_tilename = django_filters.CharFilter(
        field_name="tile__tli_tilename", label="Tilename"
    )
    position = django_filters.CharFilter(method="filter_position")
    release = django_filters.CharFilter(method="filter_release")
    inspected = django_filters.CharFilter(method="filter_inspected")

    class Meta:
        model = Dataset
        fields = [
            "id",
            "tag",
            "tile",
            "tag__in",
            "tli_tilename",
            "release",
        ]
        order_by = True

    def filter_release(self, queryset, name, value):
        return queryset.filter(tag__tag_release__id=int(value))

    def filter_tag__in(self, queryset, name, value):
        return queryset.filter(tag__in=value.split(","))

    def filter_position(self, queryset, name, value):
        radec = value.split(",")

        if len(radec) != 2:
            raise Exception(
                "Invalid format to coordinate. the two values must be separated by ','."
                "example 317.8463,1.4111 or 317.8463,-1.4111"
            )

        ra = float(radec[0].strip())
        dec = float(radec[1].strip())

        # Normalizar o ra para -180 e 180 usar as colunas auxiliares urall_180 e uraur_180 para evitar problema
        # com objetos de ra entre 0 e 1
        if ra > 180:
            ra = ra - 360

        q = queryset.filter(
            tile__tli_urall_180__lt=ra,
            tile__tli_udecll__lt=dec,
            tile__tli_uraur_180__gt=ra,
            tile__tli_udecur__gt=dec,
        )

        return q

    def filter_inspected(self, queryset, name, value):
        """
        Filtra os datasets se eles foram inspecionados ou nao. relacionando com o model validation.Inspect
        os valores possiveis sao:
        True - Inspecionado e avaliado como Bom
        False - Inspecionado e avaliado como Ruin
        None -  Nao Inspecionado.

        o value da requisicao sempre sera string. esse valor
        """
        valid = {
            "true": True,
            "True": True,
            "t": True,
            "1": True,
            "false": False,
            "False": False,
            "f": False,
            "0": False,
            "null": None,
            "None": None,
            "none": None,
        }
        if value in valid:
            return queryset.filter(inspected__isp_value=valid[value])


class DatasetViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = DatasetSerializer

    filter_backends = (
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    )

    filterset_class = DatasetFilter

    search_fields = ("tile__tli_tilename",)

    ordering_fields = ("tile__tli_tilename", "date")

    ordering = ("tile__tli_tilename",)

    def get_queryset(self):

        # Recuperar os releases que o usuario tem acesso
        releases = self.request.user.get_user_releases()

        # Filtra a tabela de datasets pelo id dos releases que o usuario tem acesso.
        queryset = (
            Dataset.objects.select_related()
            .all()
            .prefetch_related("comments")
            .prefetch_related("inspected")
            .filter(tag__tag_release__pk__in=releases)
        )

        return queryset

    def get_available_files(self, dataset):
        """
        Retrieves a list of available files for a given dataset.

        Args:
            dataset (str): The dataset for which to retrieve the available files.

        Returns:
            list: A list of dictionaries containing the filename and URL of each available file.
        """
        # Exemplo URL: https://scienceserver-dev.linea.org.br/data/releases/dr2/coadd/DES2354-4414/DES2354-4414_r4907p01_g.fits.fz

        results = []
        data_path = Path(settings.DATA_DIR)
        release_path = data_path.joinpath(f'releases')
        tile_path = release_path.joinpath(dataset.archive_path)

        if not tile_path.exists():
            return results

        for file_path in tile_path.iterdir():

            relative_path = str(file_path.relative_to(data_path)).strip("/")
            url = Path(settings.DATA_SOURCE).joinpath(relative_path)

            results.append(
                {
                    "filename": file_path.name,
                    "url": str(url),
                }
            )

        return results

    @action(detail=False, methods=["get"])
    def available_files_by_id(self, request):
        """
        Retrieve the available files for a dataset based on its ID.

        Parameters:
        - request: The HTTP request object.

        Returns:
        - A Response object containing a dictionary with the following keys:
            - "results": A list of available files for the dataset.
            - "count": The number of available files.

        Raises:
        - Exception: If the 'id' parameter is missing in the request query parameters.
        """
        datasetId = request.query_params.get("id")

        if datasetId is None:
            raise Exception("ID paramater is required")

        dataset = Dataset.objects.get(id=datasetId)
        results = self.get_available_files(dataset)
        return Response(
            dict(
                {
                    "results": results,
                    "count": len(results),
                }
            )
        )

    @action(detail=True)
    def available_files(self, request, pk=None):
        """
        Retrieve the available files for a dataset.
        Parameters:
        - request: The HTTP request object.
        - pk: The primary key of the dataset.
        Returns:
        - A Response object containing a dictionary with the following keys:
            - "results": The list of available files.
            - "count": The number of available files.
        """
        dataset = self.get_object()
            
        results = self.get_available_files(dataset)

        return Response(
            dict(
                {
                    "results": results,
                    "count": len(results),
                }
            )
        )

    @action(detail=False, methods=["post"])
    def get_download_url(self, request):
        # Este metodo não faz nada alem de retornar a URL que foi passada como parametro.
        # Existe apenas para manter compatibilidade com o front-end que espera que o metodo exista.
        # Herança da epoca que utilizavamos o DESAccess para download de arquivos.
        params = request.data
        file_url = params["file_url"]

        return Response(dict({"download_url": file_url}))


class DatasetFootprintViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.select_related().all()

    serializer_class = DatasetFootprintSerializer

    filter_backends = (DjangoFilterBackend,)

    filterset_class = DatasetFilter

    ordering_fields = ("id", "tag")


class SurveyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows surveys to be viewed or edited
    """

    queryset = Survey.objects.select_related().all()

    serializer_class = SurveySerializer

    filterset_fields = (
        "id",
        "srv_release",
        "srv_project",
    )

    ordering_fields = ("srv_filter__lambda_min",)


@api_view(["GET"])
def get_fits_by_tilename(request):
    if request.method == "GET":

        tag = request.query_params.get("tag", None).lower()
        tilename = request.query_params.get("tilename", None).upper()

        # http://desportal2.cosmology.illinois.edu/data/releases/y3a2_coadd/tiles/DES0334-2332/DES0334-2332_r2682p01_g.fits.fz

        data_path = settings.DATA_DIR

        relative_path = os.path.join("releases", tag, "tiles", tilename)

        tile_path = os.path.join(data_path, relative_path)

        files = os.listdir(tile_path)

        data_source = os.path.join(settings.DATA_SOURCE, relative_path) + "/"

        result = list()

        ordered_filters = dict({})
        filters = Filter.objects.all().order_by("lambda_min")
        order = 0
        for f in filters:
            ordered_filters[f.filter] = order
            order += 1

        ordered_filters["det"] = order
        order += 1
        ordered_filters["irg"] = order

        for filename in files:

            file_source = urljoin(data_source, filename)

            extension = os.path.splitext(filename)[1]

            flr = None
            ord = None

            # Se for um arquivo de imagem descobrir o filtro
            if extension == ".fz":
                parts = filename.split("_")
                flr = parts[2].strip("_")
                flr = flr.split(".")[0]
                try:
                    ord = ordered_filters[flr]
                except:
                    pass

            if extension == ".tiff":
                parts = filename.split("_")
                flr = parts[2].strip("_")
                flr = flr.split(".")[0]
                try:
                    ord = ordered_filters[flr]
                except:
                    pass

            result.append(
                dict(
                    {
                        "filename": filename,
                        "file_source": file_source,
                        "filter": flr,
                        "order": ord,
                    }
                )
            )

        # sql = (
        #     "SELECT m.filename, m.filetype, m.band, f.path FROM proctag t, file_archive_info f, miscfile m WHERE t.pfw_attempt_id = m.pfw_attempt_id AND t.tag='" + catalog + "' AND f.filename=m.filename AND m.filetype NOT IN ('coadd_head_scamp', 'mangle_molys', 'mangle_polygons', 'mangle_csv_ccdgon', 'mangle_csv_cobjmoly', 'mangle_csv_molyccd', 'mangle_csv_molyccd', 'mangle_csv_molygon', 'coadd_psfex_model', 'coadd_qa_scamp', 'coadd_xml_scamp', 'coadd_xml_psfex', 'coadd_det_psfex_model') AND m.tilename = '" + tilename + "' ORDER BY m.filetype, m.filename")
        #
        # db = DBBase('desoper')
        # tiles = db.engine.execute(sql)
        # fits_file = {}
        # result = []
        # for tile in tiles:
        #     url = "https://desar2.cosmology.illinois.edu/DESFiles/desarchive/%s/%s.fz" % (
        #         tile[3].replace("+", "%2B"), tile[0].replace("+", "%2B"))
        #     fits_file.update({'url': url})
        #
        #     fits_file.update({
        #         'tilename': tile[0]
        #     })
        #
        #     fits_file.update({
        #         'band': tile[2]
        #     })
        #     if tile[2] != None:
        #         result.append(copy.copy(fits_file))

        return Response(dict({"results": result}))

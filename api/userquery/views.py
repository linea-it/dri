import logging
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication

from django.db.models import Q
from django.http import HttpResponse
from django.http import JsonResponse

from .models import *
from .permissions import IsOwnerOrPublic
from .serializers import *
from .tasks import create_table
from .db import RawQueryValidator

from lib.sqlalchemy_wrapper import DBBase


logger = logging.getLogger(__name__)


class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.filter()
    serializer_class = QuerySerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)

    def get_queryset(self):
        return self.queryset.filter(Q(owner=self.request.user) |
                                    Q(is_public=True))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)


class QueryValidateViewSet(viewsets.ModelViewSet):
    """
    Validate query
    """
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        data = request.data
        query_id = data.get("id", None)
        raw_sql = data.get("raw_sql", None)

        if query_id is None:
            raise Exception("Query Id is a mandatory parameter")

        q = self._get_row_by_id_or_raise_exception(query_id)

        if not self._is_user_authorized(q):
            raise Exception("User not authorized to perform this action")

        rqv = RawQueryValidator(raw_sql)
        return JsonResponse(rqv.get_json_response())

    @staticmethod
    def _get_row_by_id_or_raise_exception(id):
        try:
            return Query.objects.get(pk=id)
        except Exception as e:
            raise Exception("Id has no match on database")

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public


class QueryInspectViewSet(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        data = request.data
        line_number = data.get("line_number", None)
        raw_sql = data.get("raw_sql", None)

        db = DBBase('userquery')
        sql = raw_sql + " " + db.database.get_raw_sql_limit(line_number)

        result = db.fetchall_dict(sql)
        return JsonResponse(result, safe=False)


class CreateTableViewSet(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        data = request.data
        sql = data.get("raw_sql", None)
        table = data.get("table_name", None)

        try:
            create_table.delay(table, sql, schema=None, timeout=None)
            return HttpResponse(status=201)
        except Exception as e:
            print(str(e))
            return HttpResponse(status=400)


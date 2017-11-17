import logging
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication

from django.db.models import Q
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.models import User

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
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic)

    def get_queryset(self):
        return self.queryset.filter((Q(owner=self.request.user) | Q(is_public=True)) &
                                    Q(is_sample=False))

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SampleViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.filter()
    serializer_class = QuerySerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)

    def get_queryset(self):
        return self.queryset.filter(is_sample=True)


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.filter()
    serializer_class = TableSerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)


class QueryValidate(viewsets.ModelViewSet):
    """
    Validate query
    """
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            sql_sentence = data.get("sql_sentence", None)

            rqv = RawQueryValidator(sql_sentence)
            return JsonResponse(rqv.get_json_response())

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)


class QueryPreview(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            sql_sentence = data.get("sql_sentence", None)
            line_number = data.get("line_number", 10)

            db = DBBase('catalog')
            sql = sql_sentence + " " + db.database.get_raw_sql_limit(line_number)
            result = db.fetchall_dict(sql)

            response = {"count": len(result),
                        "message": None,
                        "results": result}
            return JsonResponse(response, safe=False)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)


class CreateTable(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            table_name = data.get("table_name", None)
            display_name = data.get("display_name", None)
            id = data.get("id", None)

            q = Query.objects.get(pk=id)

            if not self._is_user_authorized(q):
                raise Exception("User not authorized to perform this action")

            rqv = RawQueryValidator(q.sql_sentence)
            if rqv.engine.has_table(table_name, None):
                raise Exception("Table exists - choose a different name")

            if not rqv.is_query_validated():
                raise Exception("Invalid query: %s" % rqv.validation_error_message())

            q = Job(display_name=display_name,
                    owner=self.request.user,
                    sql_sentence=q.sql_sentence)
            q.save()

            timeout = self._time_out_query_execution(request)
            create_table.delay(q.id, request.user.pk, table_name, schema=None, timeout=timeout)
            return HttpResponse(status=200)
        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public

    def _time_out_query_execution(self, request):
        user = User.objects.get(pk=request.user.pk)
        try:
            user.groups.get(name='NCSA')
            return settings.USER_QUERY_EXECUTION_NCSA_USER_IN_SECONDS
        except Exception as e:
            return settings.USER_QUERY_EXECUTION_NON_NCSA_USER_IN_SECONDS


class TableProperties(viewsets.ModelViewSet):
    http_method_names = ['get', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request):
        try:
            tables = Table.objects.filter(owner=request.user)

            db = DBBase('catalog')
            response = {}
            for table in tables:
                response[table.table_name] = db.get_table_columns(table.table_name)

            return JsonResponse(response)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public

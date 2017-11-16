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

            # review number of elements to show
            line_number = 10
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

            q = Job(table_name=table_name,
                    display_name=display_name,
                    owner=self.request.user,
                    sql_sentence=q.sql_sentence)
            q.save()
            create_table.delay(q.id, request.user.pk, table_name, schema=None, timeout=None)
            return HttpResponse(status=200)
        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public


class TableProperties(viewsets.ModelViewSet):
    http_method_names = ['get', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request):
        try:
            jobs = Job.objects.filter(Q(owner=request.user) &
                                      Q(job_status='ok'))

            db = DBBase('catalog')
            response = {}
            for job in jobs:
                response[job.table_name] = db.get_table_columns(job.table_name)

            return JsonResponse(response)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public

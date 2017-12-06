import logging
import copy
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework import permissions, filters
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication

from django.db.models import Q, Case, Value, When
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.models import User

from .models import *
from .permissions import IsOwnerOrPublic
from .serializers import *
from .tasks import create_table
from .db import RawQueryValidator
from .target_viewer import register_table_in_the_target_viewer

from lib.sqlalchemy_wrapper import DBBase


logger = logging.getLogger(__name__)


class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.filter()
    serializer_class = QuerySerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic)

    def create(self, request, *args, **kwargs):
        if not self._is_query_name_already_defined_by_the_user(request):
            return JsonResponse({'message': 'The field name already exists for this user'}, status=400)
        return super(QueryViewSet, self).create(request, args, kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        return self.queryset.filter((Q(owner=self.request.user) | Q(is_public=True)) &
                                    Q(is_sample=False)).order_by('name')

    def _is_query_name_already_defined_by_the_user(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.__is_query_name_already_defined_by_the_user(serializer.validated_data['name'])

    def __is_query_name_already_defined_by_the_user(self, name):
        q = Query.objects.filter(Q(owner=self.request.user) &
                                 Q(name=name))
        return True if len(q) > 0 else False

    def update(self, request, *args, **kwargs):
        if self._is_query_name_already_defined_by_the_user(request):
            # if is the own field, must accept
            q = Query.objects.get(pk=kwargs['pk'])
            if not q.name == request.data['name']:
                return JsonResponse({'message': 'The field name already exists for this user'}, status=400)
        return super(QueryViewSet, self).update(request, args, kwargs)

    def perform_update(self, serializer):
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

    http_method_names = ['get', 'delete', 'put']
    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user).order_by('display_name')

    def destroy(self, request, *args, **kwargs):
        try:
            # drop table
            db = DBBase('catalog')
            q = Table.objects.get(pk=kwargs['pk'])

            db.drop_table(q.table_name, schema=q.schema)

            return super(TableViewSet, self).destroy(request, args, kwargs)
        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    http_method_names = ['get', ]
    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic,)

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user).order_by(
            Case(
                When(job_status='st', then=Value('0')),
                When(job_status='rn', then=Value('1')),
                default=Value('2')),
            'start_date_time'
        )


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


class QueryPreview(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)

    def create(self, request):
        try:
            data = request.data
            sql_sentence = data.get("sql_sentence", None)

            offset = data.get('offset', 0)
            limit = data.get('limit', 10)

            db = DBBase('catalog')
            sql = sql_sentence + " " + db.database.get_raw_sql_limit(offset, limit)
            result = db.fetchall_dict(sql)

            # make all values String to avoid errors during Json encoding.
            for raw in result:
                for k, v in raw.items():
                    raw[k] = str(v)

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
            display_name = data.get("display_name", None)
            associate_target_viewer = bool(data.get("associate_target_viewer", False))
            _id = data.get("id", None)

            table_name = self._set_internal_table_name(display_name, self.request.user.pk)

            q = Query.objects.get(pk=_id)

            if type(associate_target_viewer) is not bool:
                raise Exception("associate_target_viewer must be a boolean type")

            if not self._is_user_authorized(q):
                raise Exception("User not authorized to perform this action")

            rqv = RawQueryValidator(q.sql_sentence)
            if rqv.table_exists(table_name, None):
                raise Exception("Table exists - choose a different name")

            if not rqv.is_query_validated():
                raise Exception("Invalid query: %s" % rqv.validation_error_message())

            q = Job(display_name=display_name,
                    owner=self.request.user,
                    sql_sentence=q.sql_sentence)
            q.save()

            timeout = self._time_out_query_execution(request)
            create_table.delay(q.id, request.user.pk, table_name, associate_target_viewer, schema=None, timeout=timeout)
            return HttpResponse(status=200)
        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public

    def _set_internal_table_name(self, display_name, user_id):
        table_name = copy.deepcopy(display_name)

        name = table_name.replace(' ', '_').lower().strip().strip('\n') + '_' + str(user_id)

        # Retirar qualquer caracter que nao seja alfanumerico exceto '_'
        table_name = ''.join(e for e in name if e.isalnum() or e == '_')

        # Limitar a 40 characteres
        return table_name[:40]

    def _time_out_query_execution(self, request):
        user = User.objects.get(pk=request.user.pk)
        try:
            user.groups.get(name='NCSA')
            return settings.USER_QUERY_EXECUTION_NCSA_USER_IN_SECONDS
        except Exception as e:
            return settings.USER_QUERY_EXECUTION_NON_NCSA_USER_IN_SECONDS


class TableProperties(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            schema = data.get("schema", None)
            table_name = data.get("table_name", None)

            if not table_name:
                raise Exception("Table is a mandatory field")

            # review - create table is saving using UPPER_CASE
            table_name = table_name.upper()
            db = DBBase('catalog')

            if not db.table_exists(table_name, schema=schema):
                raise Exception("Schema/table does not exist")

            response = {
                    'columns': db.get_table_properties(table_name, schema=schema)
                }

            return JsonResponse(response, safe=False)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public


class TargetViewerRegister(viewsets.ModelViewSet):
    http_method_names = ['post', ]
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            _id = data.get("id", None)

            if not _id:
                raise Exception("id is a mandatory field")

            q = Table.objects.get(pk=_id)
            register_table_in_the_target_viewer(self.request.user, q.pk)
            return HttpResponse(status=200)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

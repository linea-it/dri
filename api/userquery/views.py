import logging
import copy
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework import permissions, filters
from rest_framework.authentication import TokenAuthentication, SessionAuthentication, BasicAuthentication

from django.db.models import Q, Case, Value, When, F
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.models import User

from .models import *
from .permissions import IsOwnerOrPublic
from .serializers import *
from .tasks import create_table, export_table
from .db import RawQueryValidator
from .target_viewer import TargetViewer

from product.export import Export

from lib.sqlalchemy_wrapper import DBBase

class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.filter()
    serializer_class = QuerySerializer

    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrPublic)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        return self.queryset.filter((Q(owner=self.request.user) | Q(is_public=True)) &
                                    Q(is_sample=False)).order_by('name')

    def get_object(self):
        return Query.objects.get(pk=self.kwargs['pk'])

    def create(self, request, *args, **kwargs):
        if self.is_query_name_used_by_user():
            msg_error = "This query name is already defined by this user"
            return JsonResponse({'message': msg_error}, status=400)

        return super(QueryViewSet, self).create(request, args, kwargs)

    def update(self, request, *args, **kwargs):
        if self.is_query_name_used_by_user():

            # if enter the same query name
            q = Query.objects.get(pk=self.kwargs['pk'])
            if q.name == request.data['name']:
                return super(QueryViewSet, self).update(request, args, kwargs)
            msg_error = "This query name is already defined by this user"
            return JsonResponse({'message': msg_error}, status=400)

        return super(QueryViewSet, self).update(request, args, kwargs)

    def is_query_name_used_by_user(self):
        q = Query.objects.filter(Q(owner=self.request.user) &
                                 Q(name=self.request.data['name']))
        return True if len(q) > 0 else False


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

    # http_method_names = ['get', 'delete', 'put']
    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_object(self):
        return Table.objects.get(pk=self.kwargs['pk'])

    def get_queryset(self):
        release = self.request.query_params.get('release', None)
        return self.queryset.filter(Q(owner=self.request.user) &
                                    Q(release=release)).order_by('display_name')

    def create(self, request, *args, **kwargs):
        if self.is_display_name_used_by_user():
            msg_error = "This output table is already defined by this user"
            return JsonResponse({'message': msg_error}, status=400)

        try:
            data = request.data
            display_name = data.get("display_name", None)
            associate_target_viewer = data.get("associate_target_viewer", "") == 'on'
            query_name = data.get("query_name", None)
            sql_sentence = data.get("sql_sentence", None)
            release_id = data.get("release_id", None)
            release_name = data.get("release_name", None)

            if not query_name:
                query_name = "Unnamed"

            if not sql_sentence:
                raise Exception("sql_sentence parameters must exist")
            if not release_id:
                raise Exception("release_id parameters must exist")

            table_name = self._set_internal_table_name(display_name, self.request.user.pk)

            # query validate and sentence row count
            rqv = RawQueryValidator(raw_sql=sql_sentence, use_count=True, maxrows=settings.USER_QUERY_MAX_ROWS+5)
            if rqv.table_exists(table_name, None):
                raise Exception("Table exists - choose a different name")

            if not rqv.is_query_validated():
                raise Exception("Invalid query: %s" % rqv.validation_error_message())

            if rqv.get_sql_count()>settings.USER_QUERY_MAX_ROWS:
                raise Exception("The query exceeded the limit of %s rows" % settings.USER_QUERY_MAX_ROWS)

            # insert row in userquery_job table
            table_userquery_job = Job(display_name=display_name,
                    owner=self.request.user,
                    sql_sentence=sql_sentence,
                    timeout=settings.USER_QUERY_EXECUTION_TIMEOUT,
                    query_name=query_name)
            table_userquery_job.save()

            # start celery job
            create_table.delay(job_id=table_userquery_job.id, 
                               user_id=request.user.pk, 
                               table_name=table_name, 
                               table_display_name=display_name,
                               release_id=release_id, 
                               release_name=release_name, 
                               associate_target_viewer=associate_target_viewer)

            return HttpResponse(status=200)
        
        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _set_internal_table_name(self, display_name, user_id):
        table_name = copy.deepcopy(display_name)

        name = table_name.replace(' ', '_').lower().strip().strip('\n') + '_' + str(user_id)

        # Retirar qualquer caracter que nao seja alfanumerico exceto '_'
        table_name = ''.join(e for e in name if e.isalnum() or e == '_')

        # Limitar a 40 characteres
        return table_name[:40]

    def update(self, request, *args, **kwargs):
        if self.is_display_name_used_by_user():

            # if enter the same query name
            q = Table.objects.get(pk=self.kwargs['pk'])
            if q.display_name == request.data['display_name']:
                return super(TableViewSet, self).update(request, args, kwargs)
            msg_error = "This output table is already defined by this user"
            return JsonResponse({'message': msg_error}, status=400)

        return super(TableViewSet, self).update(request, args, kwargs)

    def is_display_name_used_by_user(self):
        q = Table.objects.filter(Q(owner=self.request.user) &
                                 Q(display_name=self.request.data['display_name']))
        return True if len(q) > 0 else False

    def destroy(self, request, *args, **kwargs):
        try:
            # drop table in database if exists
            db = DBBase('catalog')
            q = Table.objects.get(pk=kwargs['pk'])
            if (db.table_exists(table=q.table_name, schema=q.schema)):
                db.drop_table(q.table_name, schema=q.schema)

            # delete register in targetviewer
            TargetViewer.unregister(q.product_id)

            return JsonResponse({'message': 'ok'}, status=200)
            # delete register in userquery
            # return super(TableViewSet, self).destroy(request, args, kwargs)
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
            F('start_date_time').desc()
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

            rqv = RawQueryValidator(raw_sql=sql_sentence, use_count=True, maxrows=settings.USER_QUERY_MAX_ROWS+5)

            if not rqv.is_query_validated():
                raise Exception("Invalid query: %s" % rqv.validation_error_message())

            if rqv.get_sql_count()>settings.USER_QUERY_MAX_ROWS:
                raise Exception("The query exceeded the limit of %s rows" % settings.USER_QUERY_MAX_ROWS)

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
                    print(k, v)
                    raw[k] = str(v)

            response = {"count": len(result),
                        "message": None,
                        "results": result}
            return JsonResponse(response, safe=False)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)


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

            db = DBBase('catalog')

            if not db.table_exists(table_name, schema=schema):
                raise Exception("Schema/table does not exist")

            table_properties = db.get_table_properties(table_name, schema=schema)

            return JsonResponse(table_properties, safe=False)

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
            _release_name = data.get("release_name", None)

            if not _id:
                raise Exception("id is a mandatory field")

            q = Table.objects.get(pk=_id)
            TargetViewer.register(user=self.request.user, table_pk=q.pk, release_name=_release_name)

            return HttpResponse(status=200)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)


class TableDownload(viewsets.ModelViewSet):
    http_method_names = ['post']
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request):
        try:
            data = request.data
            _table_id = data.get("table_id", None)

            # how to get an array depends on how it is sent
            _columns = request.POST.getlist("columns", None) 
            if not _columns:
                _columns = data.get("columns", None)

            if not _table_id:
                raise Exception("table_id is required")

            q = Table.objects.get(pk=int(_table_id))
            if not q:
                raise Exception("Table %s not exists")

            # REVIEW - is user the owner of the table?
            export_table.delay(table_id=_table_id, user_id=request.user.pk, columns=_columns)

            return HttpResponse(status=200)
            #return JsonResponse({'columns': _columns}, status=200)

        except Exception as e:
            print(str(e))
            return JsonResponse({'message': str(e)}, status=400)

    def _is_user_authorized(self, q):
        return q.owner == self.request.user or q.is_public


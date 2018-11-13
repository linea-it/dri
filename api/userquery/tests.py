from django.core.urlresolvers import resolve
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from userquery.models import *


class QueryAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

    def test_list_query_route(self):
        route = resolve('/userquery_query/')
        self.assertEqual(route.func.__name__, 'QueryViewSet')

    def test_list_query(self):
        response = self.client.get('/userquery_query/')
        self.assertEqual(response.status_code, 200)

    def test_create_query(self):
        # put new release
        post_data = {
            'rls_name': 'rls_test',
        }
        response = self.client.post('/releases/', post_data, format='json')
        self.assertEqual(response.status_code, 201)

        # put new userquery
        query_name = 'query1'
        post_data = {
            'name': query_name,
            'description': 'query1 description',
            'sql_sentence': 'select 1',
            'release': 1,
            'is_public': True,
        }
        response = self.client.post('/userquery_query/', post_data, format='json')
        self.assertEqual(response.status_code, 201)

        # return new userquery list
        response = self.client.get('/userquery_query/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], query_name)

        query_name = 'newquery1'
        put_data = {
            'name': query_name,
            'sql_sentence': 'new_query',
            'description': 'query1 description',
            'release': 1,
        }
        response = self.client.put('/userquery_query/1/', put_data, format='json')
        self.assertEqual(response.status_code, 200)

        # return new userquery list
        response = self.client.get('/userquery_query/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], query_name)

        # delete query
        response = self.client.delete('/userquery_query/1/')
        self.assertEqual(response.status_code, 204)

        # return new userquery list - (return 0 userqueries)
        response = self.client.get('/userquery_query/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class JobAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

    def test_job_route(self):
        route = resolve('/userquery_job/')
        self.assertEqual(route.func.__name__, 'JobViewSet')

    def test_job(self):
        response = self.client.get('/userquery_job/')
        self.assertEqual(response.status_code, 200)

    def test_task_status_changes(self):
        # insert new job
        q = Job(owner=self.user, sql_sentence='query 1')
        q.save()

        q = Job.objects.get(pk=1)
        self.assertEqual(q.job_status, 'st')

        q.job_status = 'rn'
        q.save()

        q = Job.objects.get(pk=1)
        self.assertEqual(q.job_status, 'rn')


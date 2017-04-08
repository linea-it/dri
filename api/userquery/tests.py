from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import AnonymousUser, User
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from userquery.models import UserQuery
from userquery.serializers import UserQuerySerializer

class UserQueryAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")        
        self.client.login(username='dri', password='dri')

    def test_list_userquery_route(self):
        route = resolve('/userquery/')
        self.assertEqual(route.func.__name__, 'UserQueryViewSet')
        
    def test_list_userquery(self):
        response = self.client.get('/userquery/')
        self.assertEqual(response.status_code, 200)
        print(response.data)
        
    # def test_create_userquery(self):
    #     #serializer = UserQuerySerializer
    #     post_data = {
    #         'name' : 'query1',
    #         'description': 'query1 description',
    #         'query' : 'select 1',
    #         'tablename': 'table_name',
    #         'is_public': True,
    #     }
    #     #data = serializer(post_data)
    #     response = self.client.post('/userquery/', post_data)
    #     self.assertEqual(response.status_code, 200)
    #     print(response.data)



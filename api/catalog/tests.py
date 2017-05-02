from django.test import TestCase
from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import AnonymousUser, User
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from catalog.models import Comments
from catalog.serializers import CommentsSerializer

class UserQueryAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")        
        self.client.login(username='dri', password='dri')

    def test_list_comments_route(self):
        route = resolve('/objectscomments/')
        self.assertEqual(route.func.__name__, 'CommentsViewSet')

    def test_list_comments(self):
        response = self.client.get('/userquery/')
        self.assertEqual(response.status_code, 200)
        
'''    def test_create_comments(self):
        #put new userquery
        queryName = 'comments1'
        post_data = {
            'catalog_id': 1,
            'object_id' : 1,
            'owner' : self.user.id,
            'comments' : 'comment 1',
        }
        response = self.client.post('/objectscomments/', post_data,format='json')
        self.assertEqual(response.status_code, 201)

        #return new comments list
        response = self.client.get('/objectscomments/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
'''
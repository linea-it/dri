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


class CommentsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

    def test_list_comments_route(self):
        route = resolve('/objectscomments/')
        self.assertEqual(route.func.__name__, 'CommentsViewSet')

    def test_list_comments(self):
        response = self.client.get('/objectscomments/')
        self.assertEqual(response.status_code, 200)

    def test_create_comments(self):
        # put new comments
        comments = 'comment 1'
        post_data = {
            'catalog_id': 1,
            'object_id': 1,
            'owner': self.user.id,
            'comments': comments,
        }
        response = self.client.post('/objectscomments/', post_data, format='json')
        self.assertEqual(response.status_code, 201)

        # return new comments list
        response = self.client.get('/objectscomments/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['comments'], comments)

        # change comments Use Patch method for partial data
        comments = 'comments 1 changed'
        put_data = {'comments': comments}
        response = self.client.patch('/objectscomments/1/', put_data, format='json')
        self.assertEqual(response.status_code, 200)

        # return new comments list
        response = self.client.get('/objectscomments/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['comments'], comments)

        # delete comments
        response = self.client.delete('/objectscomments/1/')
        self.assertEqual(response.status_code, 204)

        # return new comments list - (return 0 comments)
        response = self.client.get('/objectscomments/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

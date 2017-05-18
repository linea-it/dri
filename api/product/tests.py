from django.test import TestCase
from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import AnonymousUser, User
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from product.models import *
from product.serializers import *
from model_mommy import mommy
from model_mommy.recipe import Recipe, foreign_key
from pprint import pprint


# Create your tests here.
class FilterSetAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

        self.product = mommy.make(
            Product,
            prd_owner=self.user
        )

        self.filterset_data = dict({
            "product": self.product.pk,
            "owner": self.user.pk,
            "fst_name": "FilterSet Test"
        })

    def test_list_filterset_route(self):
        route = resolve('/filterset/')
        self.assertEqual(route.func.__name__, 'FiltersetViewSet')

    def test_list_filterset(self):
        response = self.client.get('/filterset/')
        self.assertEqual(response.status_code, 200)

    def test_crud_filterset(self):
        # Create
        response = self.client.post('/filterset/', self.filterset_data, format='json')
        self.assertEqual(response.status_code, 201)

        filterset = response.data

        # Read
        response = self.client.get('/filterset/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fst_name'], filterset['fst_name'])

        # Update
        patch_data = dict({'fst_name': "Filterset Updated"})
        response = self.client.patch(
            '/filterset/%s/' % filterset['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        # Confirm Updated
        response = self.client.get('/filterset/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fst_name'], patch_data['fst_name'])

        # Delete
        response = self.client.delete(
            '/filterset/%s/' % filterset['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get('/filterset/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class FilterConditionAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

        self.product = mommy.make(
            Product,
            prd_owner=self.user
        )

        self.filterset = mommy.make(
            Filterset,
            product=self.product,
            owner=self.user
        )

        self.condition_data = dict(
            filterset=self.filterset.pk,
            fcd_property=None,
            fcd_property_name='column1',
            fcd_operation='=',
            fcd_value='1'
        )

    def test_list_filtercondition_route(self):
        route = resolve('/filtercondition/')
        self.assertEqual(route.func.__name__, 'FilterConditionViewSet')

    def test_list_filtercondition(self):
        response = self.client.get('/filtercondition/')
        self.assertEqual(response.status_code, 200)

    def test_crud_filtercondition(self):
        # Create
        response = self.client.post('/filtercondition/', self.condition_data, format='json')
        self.assertEqual(response.status_code, 201)

        condition = response.data

        # Read
        response = self.client.get('/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fcd_property_name'], condition['fcd_property_name'])

        # Update
        patch_data = dict({'fcd_property_name': "column2"})
        response = self.client.patch(
            '/filtercondition/%s/' % condition['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        # Confirm Updated
        response = self.client.get('/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fcd_property_name'], patch_data['fcd_property_name'])

        # Delete
        response = self.client.delete(
            '/filtercondition/%s/' % condition['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get('/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

from django.test import TestCase
from django.urls import reverse, resolve
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


# ----------------------------------------- < Filters > -----------------------------------------
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
        route = resolve('/dri/api/filterset/')
        self.assertEqual(route.func.__name__, 'FiltersetViewSet')

    def test_list_filterset(self):
        response = self.client.get('/dri/api/filterset/')
        self.assertEqual(response.status_code, 200)

    def test_crud_filterset(self):
        # Create
        response = self.client.post('/dri/api/filterset/', self.filterset_data, format='json')
        self.assertEqual(response.status_code, 201)

        filterset = response.data

        # Read
        response = self.client.get('/dri/api/filterset/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fst_name'], filterset['fst_name'])

        # Update
        patch_data = dict({'fst_name': "Filterset Updated"})
        response = self.client.patch(
            '/dri/api/filterset/%s/' % filterset['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        # Confirm Updated
        response = self.client.get('/dri/api/filterset/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fst_name'], patch_data['fst_name'])

        # Delete
        response = self.client.delete(
            '/dri/api/filterset/%s/' % filterset['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get('/dri/api/filterset/')
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
        route = resolve('/dri/api/filtercondition/')
        self.assertEqual(route.func.__name__, 'FilterConditionViewSet')

    def test_list_filtercondition(self):
        response = self.client.get('/dri/api/filtercondition/')
        self.assertEqual(response.status_code, 200)

    def test_crud_filtercondition(self):
        # Create
        response = self.client.post('/dri/api/filtercondition/', self.condition_data, format='json')
        self.assertEqual(response.status_code, 201)

        condition = response.data

        # Read
        response = self.client.get('/dri/api/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fcd_property_name'], condition['fcd_property_name'])

        # Update
        patch_data = dict({'fcd_property_name': "column2"})
        response = self.client.patch(
            '/dri/api/filtercondition/%s/' % condition['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        # Confirm Updated
        response = self.client.get('/dri/api/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['fcd_property_name'], patch_data['fcd_property_name'])

        # Delete
        response = self.client.delete(
            '/dri/api/filtercondition/%s/' % condition['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get('/dri/api/filtercondition/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


# ----------------------------------------- < Cutout > -----------------------------------------
class CutOutJobAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

        self.route = '/dri/api/cutoutjob/'

        self.product = mommy.make(
            Product,
            prd_owner=self.user
        )

        self.job_data_single = dict(
            cjb_product=self.product.pk,
            cjb_display_name="Teste Cutout Job",
            cjb_status="st",
            cjb_job_id=None,
            cjb_xsize="1.0",
            cjb_ysize="1.0",
            cjb_job_type="single",
            cjb_tag=None,
            cjb_band="g,r,i,z,Y",
            cjb_Blacklist=True,
            owner=self.user.pk
        )

        self.job_data_coadd = dict(
            cjb_product=self.product.pk,
            cjb_display_name="Cutout Job Coadd",
            cjb_status="st",
            cjb_job_id=None,
            cjb_xsize="1.0",
            cjb_ysize="1.0",
            cjb_job_type="coadd",
            cjb_tag="Y3A1_COADD",
            cjb_band=None,
            cjb_Blacklist=False,
            owner=self.user.pk
        )

    def test_cutout_route(self):
        route = resolve(self.route)
        self.assertEqual(route.func.__name__, 'CutoutJobViewSet')

    # [CMP] commented due errors in TravisCI
    # we need a task to learn how to locally test TravisCI runs (to speedup the developer of tests)
    # and then configure the cutout tests
    # (probably adding rabbitmq-server, celerybeat and celeryd services in the TravisCI build process)
    # def test_cutout_crud(self):
    #     # Create
    #     response = self.client.post(
    #         self.route,
    #         self.job_data_single,
    #         format='json')

    #     self.assertEqual(response.status_code, 201)

    #     data = response.data

    #     # Read
    #     response = self.client.get(self.route)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(len(response.data), 1)
    #     self.assertEqual(response.data[0]['cjb_display_name'], data['cjb_display_name'])

    #     # Update
    #     patch_data = dict({'cjb_display_name': "CutoutJob Updated"})
    #     response = self.client.patch(
    #         self.route + '%s/' % data['id'],
    #         patch_data,
    #         format='json')

    #     self.assertEqual(response.status_code, 200)

    #     # Confirm Updated
    #     response = self.client.get(self.route)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(len(response.data), 1)
    #     self.assertEqual(response.data[0]['cjb_display_name'], patch_data['cjb_display_name'])

    #     # Delete
    #     response = self.client.delete(
    #         self.route + '%s/' % data['id'])
    #     self.assertEqual(response.status_code, 204)

    #     # Confirm Deleted
    #     response = self.client.get(self.route)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(len(response.data), 0)

    #     # Create Coadd Images
    #     response = self.client.post(
    #         self.route,
    #         self.job_data_coadd,
    #         format='json')

    #     self.assertEqual(response.status_code, 201)

    #     data = response.data

    #     # Read Coadd Images
    #     response = self.client.get(self.route)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(len(response.data), 1)
    #     self.assertEqual(response.data[0]['cjb_display_name'], data['cjb_display_name'])

class BookmarkedTestCases(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

        self.product = mommy.make(
            Product,
            prd_owner=self.user
        )

        self.bookmarked_data = dict({
            "product": self.product.pk,
            "owner": self.user.pk,
            "is_starred": True
        })


    def test_list_bookmark_route(self):
        route = resolve('/dri/api/bookmarked/')
        self.assertEqual(route.func.__name__, 'BookmarkedViewSet')

    def test_list_bookarks(self):
        response = self.client.get('/dri/api/bookmarked/')
        self.assertEqual(response.status_code, 200)

    def test_crud_filterset(self):
        # Create
        response = self.client.post('/dri/api/bookmarked/', self.bookmarked_data, format='json')
        self.assertEqual(response.status_code, 201)

        bookmarked = response.data

        # Read
        response = self.client.get('/dri/api/bookmarked/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['is_starred'], bookmarked['is_starred'])

        # Update
        patch_data = dict({'is_starred': False})
        response = self.client.patch(
            '/dri/api/bookmarked/%s/' % bookmarked['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        # Confirm Updated
        response = self.client.get('/dri/api/bookmarked/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['is_starred'], patch_data['is_starred'])

        # Delete
        response = self.client.delete(
            '/dri/api/bookmarked/%s/' % bookmarked['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get('/dri/api/bookmarked/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

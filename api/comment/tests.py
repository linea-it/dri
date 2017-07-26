import urllib
from django.test import TestCase
from django.core.urlresolvers import reverse, resolve
from django.contrib.auth.models import AnonymousUser, User
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from model_mommy import mommy

from coadd.models import Dataset


# ----------------------------------------- < Comments By Position > -----------------------------------------
class CommentPositionAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

        self.route = '/comment/position/'

        self.dataset = mommy.make(
            Dataset,
        )

        self.data = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="0.10632100",
            pst_dec="-1.68346700",
            # pst_date=None,
            pst_comment="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        )

    def test_route_comment_position(self):
        route = resolve(self.route)
        self.assertEqual(route.func.__name__, 'PositionViewSet')

    def test_crud_comment_position(self):
        # Create
        response = self.client.post(
            self.route,
            self.data,
            format='json')

        self.assertEqual(response.status_code, 201)

        data = response.data

        # Se foi criado pelo usuario correto  a flag is_ower deve ser true
        self.assertEqual(data['is_owner'], True)

        # Se o campo Data nao esta vazio
        create_date = data['pst_date']
        self.assertIsNotNone(create_date)

        # Read
        response = self.client.get(self.route)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['pst_comment'], self.data['pst_comment'])

        # Update
        patch_data = dict({
            'pst_comment': "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."})
        response = self.client.patch(
            self.route + '%s/' % data['id'],
            patch_data,
            format='json')

        self.assertEqual(response.status_code, 200)

        updated_data = response.data

        self.assertEqual(updated_data['pst_comment'], patch_data['pst_comment'])

        # Se o Campo data nao foi alterado no update
        self.assertEqual(create_date, updated_data['pst_date'])

        # Confirm Updated
        response = self.client.get(self.route)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        # Delete
        response = self.client.delete(
            self.route + '%s/' % data['id'])
        self.assertEqual(response.status_code, 204)

        # Confirm Deleted
        response = self.client.get(self.route)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_filter_comment_position(self):

        ll = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="-0.1",
            pst_dec="-0.1",
            pst_comment="my comment at -0.1,-0.1",
        )
        lr = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="0.1",
            pst_dec="-0.1",
            pst_comment="my comment at 0.1,-0.1",
        )
        cc = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="0.0",
            pst_dec="0.0",
            pst_comment="my comment at 0.0,0.0",
        )
        ul = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="-0.1",
            pst_dec="0.1",
            pst_comment="my comment at -0.1,0.1",
        )
        ur = dict(
            owner=self.user.pk,
            pst_dataset=self.dataset.pk,
            pst_ra="0.1",
            pst_dec="0.1",
            pst_comment="my comment at 0.1,0.1",
        )

        input_data = list()
        input_data.append(ll)
        input_data.append(lr)
        input_data.append(cc)
        input_data.append(ul)
        input_data.append(ur)

        # Create
        for d in input_data:
            response = self.client.post(
                self.route,
                d,
                format='json')

            self.assertEqual(response.status_code, 201)

        # Filter center comment only, using a rectangle just bigger
        response = self.client.get('/comment/position/?coordinates=' + urllib.parse.quote('[[-0.01, -0.01], [0.01, 0.01]]'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]['pst_ra']), str(cc['pst_ra']))
        self.assertEqual(str(response.data[0]['pst_dec']), str(cc['pst_dec']))
        self.assertEqual(str(response.data[0]['pst_comment']), str(cc['pst_comment']))

        # Filter each input
        for t in input_data:
            response = self.client.get(
                '/comment/position/?coordinates=' + urllib.parse.quote(
                    '[[%s, %s], [%s, %s]]' % (t['pst_ra'], t['pst_dec'], t['pst_ra'], t['pst_dec'])))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 1)
            self.assertEqual(str(response.data[0]['pst_ra']), str(t['pst_ra']))
            self.assertEqual(str(response.data[0]['pst_dec']), str(t['pst_dec']))
            self.assertEqual(str(response.data[0]['pst_comment']), str(t['pst_comment']))

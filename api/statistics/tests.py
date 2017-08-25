from django.core.urlresolvers import resolve
from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class StatisticsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("dri", "dri@linea.org", "dri")
        self.client.login(username='dri', password='dri')

    def test_list_Statistics_route(self):
        route = resolve('/statistics/')
        self.assertEqual(route.func.__name__, 'StatisticsViewSet')

    def test_list_statistics(self):
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)

    def test_create_statistics(self):
        event = 'test event'
        post_data = {
            'event': event,
        }
        response = self.client.post('/statistics/', post_data, format='json')
        self.assertEqual(response.status_code, 201)

        # return new statistics list
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['event'], event)
        self.assertEqual(response.data[0]['owner'], 'dri')

        # change statistics event
        newEvent = 'test event2'
        put_data = {'event': newEvent}
        response = self.client.put('/statistics/1/', put_data, format='json')
        self.assertEqual(response.status_code, 200)

        # return new statistics list
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['event'], newEvent)

        # delete statistics
        response = self.client.delete('/statistics/1/')
        self.assertEqual(response.status_code, 204)

        # return new statistics list - (return 0 userqueries)
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

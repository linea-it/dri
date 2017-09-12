from django.core.urlresolvers import resolve
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
import datetime
import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)

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
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['event'], 'API - login')
        self.assertEqual(response.data[1]['event'], event)
        self.assertEqual(response.data[0]['owner'], 'dri')

        # change statistics event
        newEvent = 'test event2'
        put_data = {'event': newEvent}
        response = self.client.put('/statistics/1/', put_data, format='json')
        self.assertEqual(response.status_code, 200)

        # return new statistics list
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['event'], newEvent)

        # delete statistics
        response = self.client.delete('/statistics/1/')
        self.assertEqual(response.status_code, 204)

        # return new statistics list - (return 0 userqueries)
        response = self.client.get('/statistics/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_user_by_date(self):
        date_now = str(datetime.datetime.now().date())
        response = self.client.get('/user_by_date?date=' + date_now)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, dict({'dri@linea.org': 1}))

    def test_visits_and_recent_login(self):
        date_now = str(datetime.datetime.now().date())
        response = self.client.get('/visits_and_recent_login')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [{'user': 'dri@linea.org', 'last_visit': date_now, "visits": 1}])

    def test_total_visits(self):
        response = self.client.get('/total_visits')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, dict({'Total Visits': 1, 'Total of users grouped by number of visits': {'0-4': 1}}))

    def test_visits_per_month(self):
        date_now = str(datetime.datetime.now().date().strftime("%Y-%m"))
        response = self.client.get('/visits_per_month')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, dict({'Visits Per Month': {date_now: 1}}))

from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from activity_statistic.reports import ActivityReports
from activity_statistic.reports import ActivityReports
import datetime

class Command(BaseCommand):
    help = 'Discorey new Des Releases and register.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            dest='email',
            default=None,
            help='add this email to the recipient list.',
        )

    def handle(self, *args, **options):
        print("Send Daily Access Statistic Email")

        print("Processing unique accesses per day")
        ActivityReports().unique_visits_today()

        print("Sending email with unique accesses per day")
        yesterday = datetime.date.today() - datetime.timedelta(days=1)

        try:
            ActivityReports().report_email_unique_visits(yesterday, to=options['email'])
            print("Check send_email.log for more details.")
        except Exception as e:
            print(f"Error sending email: {e}")
            raise CommandError(f'Error sending email.')
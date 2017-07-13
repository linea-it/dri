from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from coadd.datadiscovery import DataDiscovery


class Command(BaseCommand):
    help = 'Discorey new Des Releases and register.'

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            '--tag',
            dest='tag',
            default=None,
            help='Name of the release corresponding to the name the DES uses.',
        )

    def handle(self, *args, **options):
        DataDiscovery(options).start()

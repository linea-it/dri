from django.core.management.base import BaseCommand, CommandError
from coadd.datadiscovery import DataDiscovery

class Command(BaseCommand):
    help = 'Discorey new Des Releases and register.'

    def handle(self, *args, **options):

        DataDiscovery().start()
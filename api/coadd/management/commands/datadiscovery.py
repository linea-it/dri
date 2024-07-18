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

        parser.add_argument(
            '--image_host',
            dest='image_host',
            default='https://desportal.cosmology.illinois.edu',
            help='Hostname where the iipserver server is. to devs leave the default value to use production images. for production environments inform the domain where the application is installed. with protocol and without / at the end. example: https://desportal.cosmology.illinois.edu',
        )

    def handle(self, *args, **options):
        pass
        # DataDiscovery(options).start()

import random
import string

from datetime import datetime
from coadd.models import Release
from current_user import get_current_user
from django.conf import settings
from django.db import models


class Site(models.Model):
    sti_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='User Name')

    sti_name = models.CharField(max_length=128, verbose_name='Site')
    sti_url = models.URLField(verbose_name='Url', null=True, blank=True)

    def __str__(self):
        return str(self.sti_name)


class ExternalProcess(models.Model):
    epr_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner')

    epr_name = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Name')
    epr_username = models.CharField(
        max_length=128, verbose_name='Original Owner',
        help_text='original process username on your instances of origin.')
    epr_site = models.ForeignKey(
        Site, on_delete=models.CASCADE, verbose_name='Site',
        help_text='origin of the process. instance from which it was imported.', default=None, null=True, blank=True, )
    epr_original_id = models.CharField(
        max_length=128, null=True, verbose_name='Original Id',
        help_text='original process id on your instances of origin.')
    epr_start_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Start Date')
    epr_end_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='End Date')
    epr_readme = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Readme')
    epr_comment = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Comment', help_text='Process submission comment.')

    releases = models.ManyToManyField(
        Release,
        through='ProcessRelease',
        default=None,
        verbose_name='Releases'
    )

    def __str__(self):
        return str(self.epr_original_id)


class Export(models.Model):
    process = models.ForeignKey(
        ExternalProcess, on_delete=models.CASCADE, default=None)
    exp_username = models.CharField(
        verbose_name='User Name', max_length=128, null=True, blank=True)
    exp_date = models.DateTimeField(
        verbose_name='Date', default=datetime.now)


class ProcessRelease(models.Model):
    process = models.ForeignKey(
        ExternalProcess, on_delete=models.CASCADE)
    release = models.ForeignKey(
        Release, on_delete=models.CASCADE)


class Authorization(models.Model):
    def ticket():
        a = ''.join(random.choice(string.ascii_uppercase) for i in range(3))
        n = ''.join(str(random.randint(0, 9)) for i in range(4))
        return a + n

    ath_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner')
    ath_ticket = models.CharField(
        max_length=6, verbose_name='Ticket', default=ticket
    )
    ath_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Date')

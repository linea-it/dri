from current_user import get_current_user
from django.conf import settings
from django.db import models
import random, string


class Export(models.Model):
 
    exp_username = models.CharField(max_length=128)
    exp_date = models.DateTimeField()
    exp_external_process = models.PositiveIntegerField()


class Site(models.Model):

    sti_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='User Name')

    sti_name = models.CharField(max_length=128, verbose_name='Site')
    sti_url = models.URLField(verbose_name='Url', null=True, blank=True)


class ExternalProcess(models.Model):
    epr_name = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Internal Name')
    epr_username = models.CharField(
        max_length=128, verbose_name='User Name')
    epr_site = models.ForeignKey(
        Site, on_delete=models.CASCADE, verbose_name='Site',
        help_text='origin of the process. instance from which it was imported.', default=None)
    epr_original_id = models.PositiveIntegerField(
        null=True, verbose_name='Original Id', help_text='original process id on your instances of origin.')
    epr_start_date = models.DateTimeField(
        auto_now_add=True, blank=True, verbose_name='Start Date')
    epr_end_date = models.DateTimeField(
        auto_now_add=True, blank=True, verbose_name='End Date')
    epr_readme = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Readme')
    epr_comment = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Comment', help_text='Process submission comment.')

    def __str__(self):
        return str(self.epr_original_id)


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

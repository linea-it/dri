from django.db import models

from django.db import models
from django.conf import settings
from current_user import get_current_user
from django.contrib.auth.signals import user_logged_in, user_logged_out

class Activity(models.Model):
    class Meta:
        verbose_name_plural = "Activities"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        default=get_current_user, verbose_name='Owner')

    event = models.CharField(
        max_length=100, null=False, blank=False, verbose_name='Event')

    date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date', help_text='Creation Date')

    def __str__(self):
        return str(self.event)

def activity_log_in(sender, user, request, **kwargs):
    Activity(owner=user,event="API - login").save()

def activity_log_out(sender, user, request, **kwargs):
    Activity(owner=user,event="API - logout").save()

user_logged_in.connect(activity_log_in)
user_logged_out.connect(activity_log_out)


class Visit(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        default=get_current_user, verbose_name='Owner')

    date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date', help_text='Creation Date')

    def __str__(self):
        return str("%s - %s" % (self.owner, self.date.strftime('%Y-%m-%d %H:%M')))
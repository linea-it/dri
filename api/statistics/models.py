from django.db import models
from django.conf import settings
from current_user import get_current_user

class Statistics(models.Model):
    class Meta:
        verbose_name_plural = "Statistics"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        default=get_current_user, verbose_name='Owner')

    event = models.CharField(
        max_length=100, null=False, blank=False, verbose_name='Event')

    date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date', help_text='Creation Date')

    def __str__(self):
        return str(self.event)

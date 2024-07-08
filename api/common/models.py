# Create your models here.
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


class Filter(models.Model):
    project = models.CharField(
        max_length=20, null=True, blank=True, verbose_name='Project')
    filter = models.CharField(
        max_length=3, null=False, blank=False, verbose_name='Filter')
    lambda_min = models.FloatField(
        null=True, blank=True, verbose_name='lambda_min')
    lambda_max = models.FloatField(
        null=True, blank=True, verbose_name='lambda_max')
    lambda_mean = models.FloatField(
        null=True, blank=True, verbose_name='lambda_mean')

    def __str__(self):
        return str(self.filter)


class Profile(models.Model):
    class Meta:
        verbose_name_plural = "profile"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    display_name = models.CharField(
        verbose_name='Display Name',
        max_length=124,
        default=None,
        null=True,
        blank=True
    )

    def __str__(self):
        return str(self.user.username)

    def get_mydb_schema(self):
        return f"{settings.USER_SCHEMA_PREFIX}{self.user.username}"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, create = Profile.objects.get_or_create(user=instance)
        if profile.display_name is None:
            profile.display_name = instance.username
            profile.save()
    instance.profile.save()

from django.db import models

class Application(models.Model):
    app_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    app_url = models.URLField(
        verbose_name='URL', blank=True)
    app_short_description = models.CharField(
        max_length=128, verbose_name='Short Description', blank=True)
    app_long_description = models.CharField(
        max_length=1024, verbose_name='Long Description', blank=True)
    app_icon = models.ImageField(blank=True)
    app_thumbnail = models.ImageField(blank=True)

    def __str__(self):
        return self.app_name

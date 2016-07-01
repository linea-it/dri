from django.db import models

class Applications(models.Model):
    app_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    app_url = models.URLField(
        verbose_name='URL')
    app_short_description = models.CharField(
        max_length=128, verbose_name='Short Description')
    app_long_description = models.CharField(
        max_length=1024, verbose_name='Long Description')
    app_icon = models.ImageField()
    app_thumbnail = models.ImageField()

    def __str__(self):
        return self.app_name

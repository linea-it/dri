from django.db import models


class Application(models.Model):
    app_name = models.CharField(
        max_length=128, verbose_name='Internal Name', blank=False, null=False, default='')
    app_display_name = models.CharField(
        max_length=128, verbose_name='Display Name', blank=False, default='')
    app_url = models.CharField(
        max_length=1024, verbose_name='URL', blank=False, default='')
    app_short_description = models.TextField(
        max_length=100, verbose_name='Short Description', blank=True, null=True)
    app_long_description = models.TextField(
        max_length=2048, verbose_name='Long Description', blank=True, null=True)
    app_icon_cls = models.CharField(
        max_length=128, verbose_name='Icon CSS Class', blank=True, null=True, help_text='CSS class used for small icons'
    )
    app_icon_src = models.CharField(
        max_length=1024, verbose_name='Icon Source', blank=True, null=True, help_text='path to the applications icon.'
    )
    app_video_src = models.CharField(
        max_length=2048, verbose_name='Video Source', blank=True, null=True, help_text='Url to video. eg. https://www.youtube.com/embed/XGSy3_Czz8k'
    )
    app_order = models.IntegerField (
        verbose_name='Order', blank=True, null=True, help_text='Order in menu.'
    )
    app_disabled = models.BooleanField (
        verbose_name='Disabled', default=False, help_text='mark True to disable this application in the menu.'
    )
    def __str__(self):
        return self.app_display_name


class Tutorial(models.Model):
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, verbose_name='Application')
    ttr_title = models.CharField(
        max_length=1024, verbose_name='Title', blank=False, null=False, default='')
    ttr_src = models.CharField(
        max_length=2048, verbose_name='Video Source', blank=True, null=True, help_text='Url to video. eg. https://www.youtube.com/embed/XGSy3_Czz8k')
    ttr_description = models.TextField(
        max_length=2048, verbose_name='Description', blank=True, null=True)

    def __str__(self):
        return self.ttr_title

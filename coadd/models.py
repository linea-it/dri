from django.db import models

# Create your models here.
class Release(models.Model):

    rls_name = models.CharField(max_length=60, verbose_name='Name' )
    rls_version = models.CharField(max_length=60, null=True, blank=True, verbose_name='Version')
    rls_date = models.DateField(null=True, blank=True, verbose_name='Date')
    rls_description = models.TextField(null=True, blank=True, verbose_name='Description')
    rls_doc_url = models.URLField(null=True, blank=True, verbose_name='Doc Url')
    rls_display_name = models.CharField(max_length=60, null=True, blank=True, verbose_name='Display Name')

    def __unicode__(self):
        return self.rls_display_name
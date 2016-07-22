from django.db import models


class Rating(models.Model):

    catalog_id = models.IntegerField(
        verbose_name='Catalog', null=False)

    owner = models.IntegerField(
        verbose_name='Owner', null=False)

    object_id = models.IntegerField(
        verbose_name='Object Id', null=False, blank=False)

    rating = models.IntegerField(
        verbose_name='Rating', null=False, blank=False)

    def __str__(self):
        return self.pk

class Reject(models.Model):

    catalog_id = models.IntegerField(
        verbose_name='Catalog', null=False, blank=False)

    owner = models.IntegerField(
        verbose_name='Owner', null=False, blank=False)

    object_id = models.IntegerField(
        verbose_name='Object Id', null=False, blank=False)

    reject = models.BooleanField(
        verbose_name='Reject', default=False, null=False, blank=False)

    def __str__(self):
        return self.pk

class Comments(models.Model):

    catalog_id = models.IntegerField(
        verbose_name='Catalog', null=False, blank=False)

    owner = models.IntegerField(
        verbose_name='Owner', null=False, blank=False)

    object_id = models.IntegerField(
        verbose_name='Object Id', null=False, blank=False)

    date = models.DateTimeField(
        verbose_name='Date', null=False, blank=False)

    comments = models.TextField(
        verbose_name='Comments', null=False, blank=False)

    def __str__(self):
        return self.pk
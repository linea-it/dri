# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-12-12 12:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0002_auto_20171211_1915'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cutout',
            name='ctt_object_dec',
            field=models.CharField(blank=True, help_text='Dec in degrees, the association will be used to identify the column', max_length=7, null=True, verbose_name='Dec'),
        ),
        migrations.AlterField(
            model_name='cutout',
            name='ctt_object_ra',
            field=models.CharField(blank=True, help_text='RA in degrees, the association will be used to identify the column', max_length=7, null=True, verbose_name='RA'),
        ),
    ]
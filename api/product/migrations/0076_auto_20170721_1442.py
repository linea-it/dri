# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-07-21 14:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0075_auto_20170718_1639'),
    ]

    operations = [
        migrations.AddField(
            model_name='cutoutjob',
            name='cjb_finish_time',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Finish'),
        ),
        migrations.AddField(
            model_name='cutoutjob',
            name='cjb_start_time',
            field=models.DateTimeField(auto_now_add=True, null=True, verbose_name='Start'),
        ),
    ]
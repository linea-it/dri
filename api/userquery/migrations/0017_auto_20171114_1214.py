# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-11-14 12:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userquery', '0016_auto_20171110_1400'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='display_name',
            field=models.CharField(default='display_name_default', max_length=128, verbose_name='Name'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='job',
            name='table_name',
            field=models.CharField(max_length=128, unique=True, verbose_name='Name'),
        ),
    ]
# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-11-29 12:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userquery', '0020_auto_20171116_1858'),
    ]

    operations = [
        migrations.AlterField(
            model_name='query',
            name='description',
            field=models.CharField(max_length=256, null=True, verbose_name='Description'),
        ),
    ]
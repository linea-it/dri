# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-10-06 19:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0077_cutoutjob_cjb_cutouts_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='cutoutjob',
            name='cjb_attempts',
            field=models.PositiveIntegerField(blank=True, help_text='number of attempts to run the job in descut.', null=True, verbose_name='Attempts'),
        ),
    ]
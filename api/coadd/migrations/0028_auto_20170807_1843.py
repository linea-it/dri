# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-08-07 18:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coadd', '0027_auto_20170524_1519'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dataset',
            name='image_src_ptif',
            field=models.URLField(blank=True, default=None, help_text='Full URL for visiomatic ptif image, including the host and directory. Use the release name and tilename to create the path. Example: http://{host}/visiomatic?FIF=data/releases/{release_name}/images/visiomatic/{tilename}.ptif', null=True, verbose_name='Visiomatic PTIF'),
        ),
        migrations.AlterField(
            model_name='dataset',
            name='image_src_thumbnails',
            field=models.URLField(blank=True, default=None, help_text='Full URL to image including the host and directory. Example: http://{host}/data/releases/{release_name}/images/thumb', null=True, verbose_name='Thumbnails PNG'),
        ),
        migrations.AlterField(
            model_name='survey',
            name='srv_url',
            field=models.URLField(help_text='Full URL to the aladin images path, including the host and directory. Example: http://{host}/data/releases/{release_name}/images/aladin/{band}', verbose_name='URL'),
        ),
    ]
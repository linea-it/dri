# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-12-11 19:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cutout',
            name='ctt_file_path',
            field=models.TextField(blank=True, default=None, max_length=4096, null=True, verbose_name='File Path'),
        ),
        migrations.AlterField(
            model_name='cutoutjob',
            name='cjb_cutouts_path',
            field=models.TextField(blank=True, default=None, help_text='Path of the directory where the cutouts of this job are.', max_length=4096, null=True, verbose_name='Cutout Paths'),
        ),
        migrations.AlterField(
            model_name='cutoutjob',
            name='cjb_matched_file',
            field=models.TextField(blank=True, default=None, help_text='File containing the relations between ra, dec with the image', max_length=4096, null=True, verbose_name='Matched File'),
        ),
        migrations.AlterField(
            model_name='cutoutjob',
            name='cjb_results_file',
            field=models.TextField(blank=True, default=None, help_text='File that contains the links returned by the DesCutouts service', max_length=4096, null=True, verbose_name='Result File'),
        ),
    ]
# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-12-07 13:04
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('coadd', '0001_initial'),
        ('userquery', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='table',
            name='release',
            field=models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.CASCADE, to='coadd.Release'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='query',
            name='name',
            field=models.CharField(max_length=128, unique=True, verbose_name='Name'),
        ),
        migrations.AlterField(
            model_name='table',
            name='display_name',
            field=models.CharField(max_length=128, unique=True, verbose_name='Display name'),
        ),
        migrations.AlterField(
            model_name='table',
            name='product',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='product', to='product.Product', verbose_name='Product'),
        ),
    ]
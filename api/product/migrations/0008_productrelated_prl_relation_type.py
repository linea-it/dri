# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2018-03-15 16:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0007_product_prd_is_permanent'),
    ]

    operations = [
        migrations.AddField(
            model_name='productrelated',
            name='prl_relation_type',
            field=models.CharField(choices=[('join', 'Join'), ('input', 'Input')], default='join', max_length=10, verbose_name='Relation Type'),
        ),
    ]
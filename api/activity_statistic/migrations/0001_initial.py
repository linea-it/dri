# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-12-06 18:43
from __future__ import unicode_literals

import current_user
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.CharField(max_length=100, verbose_name='Event')),
                ('date', models.DateTimeField(auto_now_add=True, help_text='Creation Date', null=True, verbose_name='Date')),
                ('owner', models.ForeignKey(default=current_user.get_current_user, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Owner')),
            ],
            options={
                'verbose_name_plural': 'Activities',
            },
        ),
        migrations.CreateModel(
            name='Visit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True, help_text='Creation Date', null=True, verbose_name='Date')),
                ('owner', models.ForeignKey(default=current_user.get_current_user, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Owner')),
            ],
        ),
    ]

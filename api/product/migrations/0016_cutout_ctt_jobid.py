# Generated by Django 2.2.17 on 2020-11-11 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0015_cutout_ctt_img_format'),
    ]

    operations = [
        migrations.AddField(
            model_name='cutout',
            name='ctt_jobid',
            field=models.CharField(blank=True, help_text='Descut job id that generated the image.', max_length=1024, null=True, verbose_name='DES Job ID'),
        ),
    ]
# Generated by Django 2.2.17 on 2023-06-29 20:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('coadd', '0008_auto_20230629_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='ncsa_src_ptif',
            field=models.URLField(blank=True, default=None, help_text='Full URL to image in NCSA. Example: http://{host}/visiomatic?FIF=data/releases/{archive_path}/<image_path>/{tilename}.ptif', null=True, verbose_name='Thumbnails PNG'),
        ),
        migrations.AlterField(
            model_name='dataset',
            name='image_src_ptif',
            field=models.URLField(blank=True, default=None, help_text='Full URL for visiomatic ptif image, including the host and directory. Use the release name and tilename to create the path. Example: http://{host}/visiomatic?FIF=data/releases/{archive_path}/<image_path>/{tilename}.ptif', null=True, verbose_name='Visiomatic PTIF'),
        ),
    ]

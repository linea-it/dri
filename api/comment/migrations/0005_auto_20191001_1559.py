# Generated by Django 2.1.5 on 2019-10-01 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comment', '0004_auto_20190618_1400'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='dts_dec',
            field=models.FloatField(blank=True, default=None, null=True, verbose_name='Dec (deg)'),
        ),
        migrations.AddField(
            model_name='dataset',
            name='dts_ra',
            field=models.FloatField(blank=True, default=None, null=True, verbose_name='RA (deg)'),
        ),
        migrations.AddField(
            model_name='dataset',
            name='dts_type',
            field=models.CharField(choices=[('0', 'User Comment'), ('1', 'Validation History'), ('2', 'Reported Issue')], default='0', help_text='Differentiate user comments from automatic validation or defect comments.', max_length=1, verbose_name='Type'),
        ),
    ]

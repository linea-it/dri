# Generated by Django 2.1.5 on 2019-10-01 19:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comment', '0005_auto_20191001_1559'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dataset',
            name='dts_type',
            field=models.CharField(choices=[('0', 'User Comment'), ('1', 'Validation History'), ('2', 'Reported Issue')], default='0', help_text='Differentiate user comments from automatic validation or defect comments.', max_length=1, verbose_name='Type'),
        ),
    ]

# Generated by Django 3.2.9 on 2021-11-21 17:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_delete_yearstatvalue'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='daystatvalue',
            name='flame',
        ),
        migrations.RemoveField(
            model_name='daystatvalue',
            name='vibration',
        ),
        migrations.RemoveField(
            model_name='monthstatvalue',
            name='flame',
        ),
        migrations.RemoveField(
            model_name='monthstatvalue',
            name='vibration',
        ),
    ]

# Generated by Django 3.2.9 on 2021-11-16 07:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_sensorvalue_flame'),
    ]

    operations = [
        migrations.CreateModel(
            name='DayStatValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_id', models.IntegerField()),
                ('temperature', models.FloatField()),
                ('humidity', models.FloatField()),
                ('co', models.FloatField()),
                ('propane', models.FloatField()),
                ('flame', models.IntegerField()),
                ('vibration', models.IntegerField()),
                ('datetime', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='MonthStatValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_id', models.IntegerField()),
                ('temperature', models.FloatField()),
                ('humidity', models.FloatField()),
                ('co', models.FloatField()),
                ('propane', models.FloatField()),
                ('flame', models.IntegerField()),
                ('vibration', models.IntegerField()),
                ('datetime', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='YearStatValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_id', models.IntegerField()),
                ('temperature', models.FloatField()),
                ('humidity', models.FloatField()),
                ('co', models.FloatField()),
                ('propane', models.FloatField()),
                ('flame', models.IntegerField()),
                ('vibration', models.IntegerField()),
                ('datetime', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.AddField(
            model_name='sensorvalue',
            name='vibration',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='sensorvalue',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]

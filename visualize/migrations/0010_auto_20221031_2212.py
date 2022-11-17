# Generated by Django 3.2.16 on 2022-10-31 22:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visualize', '0009_userlayer'),
    ]

    operations = [
        migrations.AddField(
            model_name='userlayer',
            name='wms_params',
            field=models.TextField(blank=True, default=None, help_text="Extra WMS parameters ('&VERSION=1.1.0...')", null=True),
        ),
        migrations.AddField(
            model_name='userlayer',
            name='wms_slug',
            field=models.CharField(blank=True, default=None, help_text='WMS Layer name', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='userlayer',
            name='wms_srs',
            field=models.CharField(blank=True, default=None, help_text="CRS used for WMS requests ('EPSG:4326')", max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='userlayer',
            name='arcgis_layers',
            field=models.CharField(blank=True, default=None, help_text='comma separated list of arcgis layer IDs', max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='userlayer',
            name='description',
            field=models.TextField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='userlayer',
            name='url',
            field=models.TextField(blank=True, default=None, null=True),
        ),
    ]
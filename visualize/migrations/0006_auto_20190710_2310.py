# Generated by Django 2.2.3 on 2019-07-10 23:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visualize', '0005_auto_20190710_0058'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookmark',
            name='sharing_groups',
            field=models.ManyToManyField(blank=True, editable=False, related_name='visualize_bookmark_related', to='auth.Group', verbose_name='Share with the following groups'),
        ),
    ]

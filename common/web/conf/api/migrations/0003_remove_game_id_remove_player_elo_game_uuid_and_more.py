# Generated by Django 5.1 on 2024-08-19 13:54

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_game_finish_gameinvitation_game_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='game',
            name='id',
        ),
        migrations.RemoveField(
            model_name='player',
            name='elo',
        ),
        migrations.AddField(
            model_name='game',
            name='UUID',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True),
        ),
        migrations.AddField(
            model_name='player',
            name='eloConnect4',
            field=models.PositiveIntegerField(default=1000),
        ),
        migrations.AddField(
            model_name='player',
            name='eloPong',
            field=models.PositiveIntegerField(default=1000),
        ),
        migrations.AlterField(
            model_name='game',
            name='type',
            field=models.CharField(max_length=10),
        ),
    ]

from django.db import models
from django.contrib.auth.models import User
import requests

# Create your models here.

class Player(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    mail = models.CharField(max_length=255, unique=True)
    img = models.ImageField(default='/media/profile_pics/default.png', upload_to='profile_pics')
    created_at = models.DateTimeField(auto_now_add=True)
    elo = models.PositiveIntegerField(default=1000)
    is_online = models.BooleanField(default=False)
    lastConnexion = models.DateTimeField(default=None, null=True, blank=True)

class Friends(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player')
    friend = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friend')
    status = models.IntegerField(default=0)

class Messages(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='receiver')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Game(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2')
    time = models.IntegerField(default=0)
    winner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='winner')
    elo_before_player1 = models.IntegerField()
    elo_before_player2 = models.IntegerField()
    elo_after_player1 = models.IntegerField()
    elo_after_player2 = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    participants = models.ManyToManyField(Player, related_name='tournaments')
    games = models.ManyToManyField(Game, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class GameInvitation(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_invitations')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_invitations')
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class Request():
    def getUsers():
        r = requests.get('http://localhost:8000/api/getAllUsers/')
        return r
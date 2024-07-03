from django.db import models
from django.contrib.auth.models import User
import requests

# Create your models here.

class Player(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    mail = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    img = models.ImageField(default='/media/profile_pics/default.png', upload_to='profile_pics')
    created_at = models.DateTimeField(auto_now_add=True)
    elo = models.PositiveIntegerField(default=1000)

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

class Request():
    def getUsers():
        r = requests.get('http://localhost:8000/api/getAllUsers/')
        return r
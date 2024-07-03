# Dans leaderboard/models.py

from django.db import models

class LeaderboardEntry:
    def __init__(self, user, Elo):
        self.user = user
        self.Elo = Elo



from django.shortcuts import render
from .models import LeaderboardEntry
from django.utils.translation import activate

def leaderboard(request):
    # Exemple de données simulées pour le leaderboard
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    leaderboard_entries = [
        LeaderboardEntry(user='Utilisateur1', Elo=100),
        LeaderboardEntry(user='Utilisateur2', Elo=90),
        LeaderboardEntry(user='Utilisateur3', Elo=80),
        LeaderboardEntry(user='Utilisateur4', Elo=70),
        LeaderboardEntry(user='Utilisateur5', Elo=60),
        LeaderboardEntry(user='Utilisateur6', Elo=50),
        LeaderboardEntry(user='Utilisateur7', Elo=40),
        LeaderboardEntry(user='Utilisateur8', Elo=30),
        LeaderboardEntry(user='Utilisateur9', Elo=20),
        LeaderboardEntry(user='Utilisateur10', Elo=10),
        LeaderboardEntry(user='Utilisateur11', Elo=0),
        LeaderboardEntry(user='Utilisateur12', Elo=-10),
        LeaderboardEntry(user='Utilsateur13', Elo=-20),
    ]
    context = {
        'leaderboard': leaderboard_entries
    }
    return render(request, 'leaderboard/leaderboard.html', context)

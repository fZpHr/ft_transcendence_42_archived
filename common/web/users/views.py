# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import json
from django.utils.translation import gettext as _
from django.shortcuts import render
from rest_framework.response import Response
import requests
from django.utils.translation import activate
from django.contrib.auth.models import User
from api.models import Player, Game
from django.core import serializers
from api.login_required import login_required, not_login_required


@not_login_required
def login_view(request):
    context = { 'no_footer': True }
    return render(request, 'login/login_view.html', context)

@login_required
def profil_view(request, format=None):
    try:
        data = Player.objects.get(username=request.user)
        is42 = True
        print("================== DEBOG IMG", data.img)
        if (data.img.name.startswith("profile_pics/")):
            is42 = False
        games = (Game.objects.filter(player1=data, finish=True) | Game.objects.filter(player2=data, finish=True))
        games = games.order_by('-created_at')
        print('games', games)
        matches = []
        print("=============================================================================================")
        for game in games:
            game.player1.img.name = '/media/' + game.player1.img.name if game.player1.img.name.startswith("profile_pics/") else game.player1.img.name
            game.player2.img.name = '/media/' + game.player2.img.name if game.player2.img.name.startswith("profile_pics/") else game.player2.img.name
            total_seconds = game.time
            minutes, seconds = divmod(total_seconds, 60)
            match_data = {
                'player1_username': game.player1.username,
                'player2_username': game.player2.username,
                'p1_img': game.player1.img.name,
                'p2_img': game.player2.img.name,
                'time_minutes': minutes,
                'time_seconds': seconds,
                'winner_username': game.winner.username,
                'elo_player1': game.elo_before_player1 - game.elo_after_player1,
                'elo_player2': game.elo_before_player2 - game.elo_after_player2,
            }
            matches.append(match_data)
        user_data = {
            'visited': False,
            'username': data.username,
            'mail': data.mail,
            'friends_count': 10,
            'elo': data.elo,
            'avatar_url': data.img,
            'is42': is42,
            'matches': matches
        }
        return render(request, 'profil/profil_view.html', {'user_data': user_data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required
def visited_profil_view(request, username):
    try:
        data = Player.objects.get(username=username)
        # language_code = request.session.get('django_language', 'en')
        # activate(language_code)
        is42 = True
        if (data.img.name.startswith("profile_pics")):
            is42 = False
        user_data = {
            'visited': True,
            'username': data.username,
            'mail': data.mail,
            'friends_count': 10,
            'elo': data.elo,
            'avatar_url': data.img,
            'is42': is42,
            'matches': []
        }
        games = Game.objects.filter(player1=data) | Game.objects.filter(player2=data)
        games = games.order_by('-created_at')
        for game in games:
            match_data = {
                'player1': game.player1,
                'player2': game.player2,
                'time': game.time,
                'winner': game.winner,
                'elo_before_player1': game.elo_before_player1,
                'elo_before_player2': game.elo_before_player2,
                'elo_after_player1': game.elo_after_player1,
                'elo_after_player': game.elo_after_player2
            }
            user_data['matches'].append(match_data)
        return render(request, 'profil/profil_view.html', {'user_data': user_data})
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required
def progress_view(request):
    return render(request, 'progress/progress.html')

@login_required
def visited_progress_view(request, username):
    return render(request, 'progress/progress.html', {'username': username})

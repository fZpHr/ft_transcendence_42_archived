from django.shortcuts import render, redirect
from api.models import Game, Lobby, Player, Game_Tournament, Tournament

from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from rest_framework.decorators import parser_classes
from rest_framework.parsers import FormParser
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout as auth_logout
import requests
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db.models import Case, IntegerField, Sum, When
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.conf import settings

# ======================== Decorateur Validator ============================

def login_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(settings.LOGIN_URL)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# =============================================================================

@login_required
def joinGame(request):
    try:
        currentPlayer = request.user.player
        lobby_id = request.GET.get('lobby_id', 'default_value')
        lobby = Lobby.objects.get(UUID=lobby_id)
        
        # Assuming the lobby is linked to a tournament via the Tournament model's UUID_LOBBY field
        tournament = Tournament.objects.get(UUID_LOBBY=lobby)
        
        # Fetch all games associated with the tournament
        tournament_games = tournament.games.all()
        
        # Check if the current player is in any of the tournament's games
        for game in tournament_games:
            if game.players.filter(id=currentPlayer.id).exists() :
                # get the id of the game
                game_id = game.id
                print(f"Player is in game with id: {game_id}")
        

        return HttpResponse("Player is not in any of the tournament's games. Proceed with joining logic.")
    except Lobby.DoesNotExist:
        return HttpResponse("Lobby does not exist.")
    except Tournament.DoesNotExist:
        return HttpResponse("Tournament does not exist for the given lobby.")
    except Exception as e:
        return HttpResponse(f"An error occurred: {str(e)}")

@login_required
def ranked(request):
    return render(request, "ranked/ranked.html")

@login_required
def connect4(request):
    return render(request, "ranked/connect4.html")

@login_required
def pong3D(request):
    return render(request, "pong3D/pong3D.html")

@login_required
def game(request):
    return render(request, "home/home.html")

# view valide

@login_required
def pongLocal(request):
    return render(request, "pongLocal/pongLocal.html")

@login_required
def pongCustom(request):
    return render(request, "pongCustom/pongCustom.html")

@login_required
def pongPrivGame(request):
    user = request.user
    player = Player.objects.get(username=user.username)
    opponentId = request.GET.get('opponent', 'default_value')
    opponent = Player.objects.get(id=opponentId)

    privGame = Game.objects.filter(players__in=[player, opponent], type='private')
    print('================ opp ',opponent)
    print('================ play ',player)
    user = {
        'player' : {
            'id': player.id,
            'username': player.username,
            'img': player.img,
        },
        'opponent' : {
            'id': opponent.id,
            'username': opponent.username,
            'img': opponent.img,
        },
        'game': {
            'id': newGamePriv.id,
            'type': newGamePriv.type,
            'status': newGamePriv.status,
            'finish': newGamePriv.finish,
        }
    }

    return render(request, "pongPrivGame/pongPrivGame.html")

@login_required
def pongTournament(request):
    return render(request, "pongTournament/pongTournament.html")

@login_required
def pongTournamentLobby(request):
    try:
        lobby_id = request.GET.get('lobby_id', 'default_value')
        lobby = Lobby.objects.get(UUID=lobby_id)
        players = lobby.players.all()
        for player in players:
            if hasattr(player, 'img') and player.img:
                img_path = str(player.img)
                if img_path.startswith('profile_pics/'):
                    player.img = '/media/' + img_path
        ia_players = lobby.ai_players.all()
        return render(request, "pongTournament/pongTournamentLobby.html", {"lobby": lobby, "players": players, "ia_players": ia_players})
    except Lobby.DoesNotExist:
        return render(request, "pongTournament/pongTournament.html", {"error": "Lobby not found"})
    except Exception as e:
        return render(request, "pongTournament/pongTournament.html", {"error": "An unexpected error occurred"})

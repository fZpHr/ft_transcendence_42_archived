from django.shortcuts import render, redirect
from api.models import Game, Lobby, Player, Game_Tournament, Tournament, GameInvitation

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
    if (request.htmx):
        return render(request, "ranked/ranked.html")
    return render(request, "ranked/ranked_full.html")

@login_required
def connect4(request):
    return render(request, "ranked/connect4.html")

@login_required
def pong3D(request):
    return render(request, "pong3D/pong3D.html")

@login_required
def gameHome(request):
    if (request.htmx):
        return render(request, "home/home.html")
    return render(request, "home/home_full.html")

# view valide

@login_required
def pongLocal(request):
    if request.htmx:
        return render(request, "pongLocal/pongLocal.html")
    return render(request, "pongLocal/pongLocal_full.html")

@login_required
def pongCustom(request):
    if request.htmx:
        return render(request, "pongCustom/pongCustom.html")
    return render(request, "pongCustom/pongCustom_full.html")

@login_required
def pongPrivGame(request):
    user = request.user
    player = Player.objects.get(username=user.username)
    opponentId = request.GET.get('opponent', 'default_value')
    opponent = Player.objects.get(id=opponentId)

    invitGame = GameInvitation.objects.filter(player1=player, player2=opponent)
    if not invitGame:
        invitGame = GameInvitation.objects.filter(player1=opponent, player2=player)
    if not invitGame:
        return render(request, "pongPrivGame/pongPrivGame.html", {"error": "Game not found"})
    player.img = player.img.name.startswith('profile_pics/') and '/media/' + player.img.name or player.img
    opponent.img = opponent.img.name.startswith('profile_pics/') and '/media/' + opponent.img.name or opponent.img
    privGame = Game.objects.get(id=invitGame[0].game_id.id)
    print('===========================', privGame.player1)
    print('===========================', privGame.player2)
    data = {
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
            'id': privGame.id,
            'type': privGame.type,
            'finish': privGame.finish,
            'p1Id': privGame.player1.id,
            'p2Id' : privGame.player2.id,
        }
    }
    print(data)
    return render(request, "pongPrivGame/pongPrivGame.html", data)

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
        if request.htmx:
            print("htmx")
            return render(request, "pongTournament/pongTournamentLobby.html", {"lobby": lobby, "players": players, "ia_players": ia_players})
        print("no htmx")
        return render(request, "pongTournament/pongTournamentLobby_full.html", {"lobby": lobby, "players": players, "ia_players": ia_players})
    except Lobby.DoesNotExist:
        if request.htmx:
            print("htmx")
            return render(request, "pongTournament/pongTournament.html", {"error": "Lobby not found"})
        print("no htmx")
        return render(request, "pongTournament/pongTournament_full.html", {"error": "Lobby not found"})
    except Exception as e:
        if request.htmx:
            print("htmx")
            return render(request, "pongTournament/pongTournament.html", {"error": "An unexpected error occurred"})
        print("no htmx")
        return render(request, "pongTournament/pongTournament_full.html", {"error": "An unexpected error occurred"})

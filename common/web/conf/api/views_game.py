# api/views_game.py
from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Player, Friends, Messages, User, Lobby, AIPlayer, Tournament, Game_Tournament
from rest_framework.decorators import parser_classes
from rest_framework.parsers import FormParser
from .serializer import LoginEncoder, PlayerSerializer
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout as auth_logout
import requests
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db.models import Case, IntegerField, Sum, When
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.exceptions import ValidationError
from .models import Game
import random
from functools import reduce
from api.login_required import login_required


@api_view(['GET'])
@login_required
def getHistoryGame(request):
    try:
        print("getHistoryGame")
        user = request.user
        print("user [", user, "]")
        player = Player.objects.get(username=user)
        print("player [", player, "]")
        games = Game.objects.filter(player1=player) | Game.objects.filter(player2=player)
        games = games.order_by('-created_at')
        serialized_games = serializers.serialize('json', games)
        return Response(serialized_games, status=200)
    
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ===============================================================================================
# ============================================ LOBBY ============================================
# ===============================================================================================

@api_view(['GET'])
@login_required
def createLobby(request):
    try:
        user = request.user
        owner = Player.objects.get(username=user.username)
        lobby = Lobby.objects.create(owner=owner)
        lobby.players.add(owner)
        lobby.save()
        return Response({"lobby": lobby.UUID}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def getAllLobby(request):
    try:
        user = request.user
        player = Player.objects.get(username=user.username)
        tab = []
        lobbys = Lobby.objects.all()
        for lobby in lobbys:
            if player in lobby.players.all():
                tab.append(lobby.UUID)
        return Response({"data": tab}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@login_required
def getUserById(request):
    try:
        userId = request.GET.get('userId')
        player = Player.objects.get(id=userId)
        player = {
            "id": player.id,
            "username": player.username,
            "img": str(player.img)
        }        
        return Response(player, status=200)
    except Player.DoesNotExist:
        return Response({"error": f"Player with id {userId} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@csrf_exempt
@api_view(['POST'])
@login_required
def addPlayerToLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        userId = request.data.get('userId')
        player = Player.objects.get(id=userId)
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        lobby.players.add(player)
        lobby.save()
        return Response({"lobby": 'a'}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Player.DoesNotExist:
        return Response({"error": f"Player with id {userId} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@login_required
def addIaToLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        newIa = AIPlayer.objects.create()
        lobby.ai_players.add(newIa)
        lobby.save()
        return Response({"lobby": 'a'}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getUserAvailableToLobby(request):
    try:
        lobbyUUID = request.GET.get('lobbyUUID')
        allPlayer = Player.objects.all()
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        playerAlreadyInLobby = lobby.players.all()
        userLst = []
        for user in allPlayer:
            if user not in playerAlreadyInLobby:
                userData = {}
                userData['id'] = user.id
                userData['username'] = user.username
                userData['img'] = str(user.img)
                userLst.append(userData)
        return Response(userLst, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def getAllParticipants(lobby):
    player_participants = lobby.players.all()
    ia_participants = lobby.ai_players.all()
    participants = []
    
    for player in player_participants:
        participant = {
            'id': player.id,
            'isIA': False
        }
        participants.append(participant)
    
    for ia in ia_participants:
        participant = {
            'id': ia.id,
            'isIA': True
        }
        participants.append(participant)
    random.shuffle(participants)
    return participants


def createGame(participants, gameIndex):
    game = {
        'gameIndex': gameIndex,
        'winner': None,
        'players': []
    }
    for participant in participants:
        game['players'].append(participant)
    return game

def decompositionProduitFactorPremier(n):
    facteurs = []
    i = 2
    while i <= n:
        if n % i == 0:
            facteurs.append(i)
            n = n // i
        else:
            i += 1
    return facteurs

def getNbrGame(nbrParticipants, DFP):
    if not DFP:
        print('DFP is empty')
        return 0

    nbrGame = 0
    indexDFP = len(DFP) - 1
    while indexDFP >= 0:
        nbrGame += nbrParticipants / DFP[indexDFP]
        nbrParticipants = nbrParticipants / DFP[indexDFP]
        indexDFP -= 1
    return int(nbrGame)

def makeMatchMakingTournament(lobby, UUIDTournament):
    print('makeMatchMakingTournament')
    print(UUIDTournament)

    participants = getAllParticipants(lobby)
    nbrParticipants = len(participants)
    DFP = decompositionProduitFactorPremier(nbrParticipants)
    nbrGame = getNbrGame(nbrParticipants, DFP)
    nbrFirstGame = reduce(lambda x, y: x * y, DFP[:-1])
    nbrParticipantsForFirstGame = nbrParticipants // nbrFirstGame
    print('nbrParticipants', nbrParticipants)
    print('DFP = > [', DFP, ']')
    print('nbrGame = >', nbrGame)
    print('nbrFirstGame = >', nbrFirstGame)
    print('nbrParticipantsForFirstGame = >', nbrParticipantsForFirstGame)

    for i in range(nbrFirstGame):
        participantsForGame = participants[i*nbrParticipantsForFirstGame:(i+1)*nbrParticipantsForFirstGame]
        userParticipating = []
        iaParticipating = []
        for participant in participantsForGame:
            if participant.get('isIA') == False:
                userParticipating.append(Player.objects.get(id=participant.get('id')))
            else :
                iaParticipating.append(AIPlayer.objects.get(id=participant.get('id')))
        Game_Tournament.objects.create(UUID_TOURNAMENT=Tournament.objects.get(UUID=UUIDTournament))
        game = Game_Tournament.objects.last()
        game.players.set(userParticipating)
        game.ai_players.set(iaParticipating)
        game.save()
    nbrOtherGame = nbrGame - nbrFirstGame
    for i in range(nbrOtherGame):
        Game_Tournament.objects.create(UUID_TOURNAMENT=Tournament.objects.get(UUID=UUIDTournament))

@csrf_exempt
@api_view(['POST'])
@login_required
def lockLobby(request):
    try:
        lobbyUUID = request.data.get('lobbyUUID')
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        lobby.locked = True
        lobby.save()
        # delte all tournamenet game
        if Tournament.objects.filter(UUID_LOBBY=lobby).exists():
            return Response({"error": "Tournament already exists for lobby with id {lobbyUUID}"}, status=200)
        if Game_Tournament.objects.filter(UUID_TOURNAMENT__UUID_LOBBY=lobby).exists():
            return Response({"error": "Tournament already exists for lobby with id {lobbyUUID}"}, status=200)

        print('===========================================')
        Tournament.objects.create(UUID_LOBBY=lobby)
        tournament = Tournament.objects.get(UUID_LOBBY=lobby)
        makeMatchMakingTournament(lobby, tournament.UUID)
        # Initialize tournamentOrganized as a dictionary
        tournamentOrganized = {}
        tournamentOrganized['UUID'] = tournament.UUID
        tournamentOrganized['games'] = []

        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        for game in games:
            gameData = {}
            gameData['id'] = game.id
            gameData['winner_player'] = game.winner_player.id if game.winner_player else None
            gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
            gameData['players'] = []
            for player in game.players.all():
                gameData['players'].append(player.id)
            for ia in game.ai_players.all():
                gameData['players'].append(ia.id)
            tournamentOrganized['games'].append(gameData)

        return Response({"tournament": tournamentOrganized}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ===============================================================================================
# ============================================ UTILS ============================================
# ===============================================================================================


@api_view(['GET'])
@login_required
def getTournamentInfo(request):
    try:
        UUID_TOURNAMENT = request.GET.get('tournamentUUID')
        tournament = Tournament.objects.get(UUID=UUID_TOURNAMENT)
        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        tournamentOrganized = {}
        tournamentOrganized['UUID'] = tournament.UUID
        tournamentOrganized['games'] = []
        for game in games:
            gameData = {}
            gameData['id'] = game.id
            gameData['winner_player'] = game.winner_player.id if game.winner_player else None
            gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
            gameData['players'] = []
            for player in game.players.all():
                gameData['players'].append(player.id)
            for ia in game.ai_players.all():
                gameData['players'].append(ia.id)
            tournamentOrganized['games'].append(gameData)
        return Response({"tournament": tournamentOrganized}, status=200)
    except Tournament.DoesNotExist:
        return Response({"error": f"Tournament does not exist for lobby with id {UUID_TOURNAMENT}"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    


# ===============================================================================================
# ============================================ GAME MANDA ============================================
# ===============================================================================================


@api_view(['POST'])
@login_required
def logUserForPlay(request):
    try:
        user = request.user
        mail = request.POST.get("email")
        if user.email == mail:
            return JsonResponse({'success': False, 'error': 'Its your email'})
        password = request.POST.get("pass")
        player = Player.objects.get(mail=mail)
        user = authenticate(request, username=player.username, password=password)
        if user is not None:
            return JsonResponse({'success': True, 'username': player.username, 'img': str(player.img),
                                 'id': player.id, 'eloPong': player.eloPong, 'eloConnect4': player.eloConnect4})
        else:
            return JsonResponse({'success': False, 'error': 'Invalid email or password'})
    except Player.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Invalid email or password'})
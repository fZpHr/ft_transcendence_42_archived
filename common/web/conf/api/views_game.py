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


import logging

logger = logging.getLogger('print')


@api_view(['GET'])
@login_required
def getHistoryGame(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
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
        lobbys = Lobby.objects.all().order_by('created_at')
        for lobby in lobbys:
            if player in lobby.players.all():
                nbr_players = len(lobby.players.all())
                nbr_players += len(lobby.ai_players.all())
                lobby_info = {
                    'UUID': lobby.UUID,
                    'name': lobby.name,
                    'isLocked': lobby.locked,
                    'nbr_players': nbr_players,
                    'owner': lobby.owner.id,
                }
                tab.append(lobby_info)
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
            'isIA': False,
            'username': player.username,
            'img': player.img
        }
        participants.append(participant)
    
    for ia in ia_participants:
        participant = {
            'id': ia.id,
            'isIA': True,
            'username': 'ia',
            'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp'
        }
        participants.append(participant)
    random.shuffle(participants)
    return participants


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
        return 0

    nbrGame = 0
    indexDFP = len(DFP) - 1
    while indexDFP >= 0:
        nbrGame += nbrParticipants / DFP[indexDFP]
        nbrParticipants = nbrParticipants / DFP[indexDFP]
        indexDFP -= 1
    return int(nbrGame)

def makeMatchMakingTournament(lobby, UUIDTournament):

    participants = getAllParticipants(lobby)
    nbrParticipants = len(participants)
    DFP = decompositionProduitFactorPremier(nbrParticipants)
    nbrGame = getNbrGame(nbrParticipants, DFP)
    nbrFirstGame = reduce(lambda x, y: x * y, DFP[:-1])
    nbrParticipantsForFirstGame = nbrParticipants // nbrFirstGame

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

def get_nbr_party_by_tour(nbr_participants, tour, DFP):
    if len(DFP) == 0:
        return 0

    nbr_game = 0
    index_DFP = len(DFP) - 1
    i = 0
    while index_DFP >= 0 and i < tour:
        nbr_game = nbr_participants / DFP[index_DFP]
        nbr_participants = nbr_participants / DFP[index_DFP]
        index_DFP -= 1
        i += 1
    return int(nbr_game)

def getAllGamesAtTurn(indexFirstGame, turn, DFP, nbrParticipants):
    try :
        # logger.info('====================> GET ALL GAMES AT TURN')
        # logger.info(f"      indexFirstGame [{indexFirstGame}]")
        # logger.info(f"      turn [{turn}]")
        # logger.info(f"      DFP [{DFP}]")
        # logger.info(f"      nbrParticipants [{nbrParticipants}]")
        gameTab = []
        nbrGame = 0
        for i in range(turn):
            nbrGame += get_nbr_party_by_tour(nbrParticipants, i, DFP)
        indexFirstGame += nbrGame
        nbrGame = get_nbr_party_by_tour(nbrParticipants, turn, DFP)
        for i in range(nbrGame):
            gameTab.append(Game_Tournament.objects.get(id=indexFirstGame + i))
            # logger.info(f"      game [{Game_Tournament.objects.get(id=indexFirstGame + i)}]")
        # logger.info('====================> END OF GET ALL GAMES AT TURN')
        return gameTab
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def count_divisions_by_n(number, n):
    count = 0
    while number >= n:
        number /= n
        count += 1
    return count

def setNextGameForGame(currentGame, nextGames, cptLeft, cptRight):
    try :
        nextGameId = None
        logger.info('====================> SET NEXT GAME FOR GAME')
        logger.info(f"      nextGames [{nextGames}]")
        logger.info(f"      nextGamesCOUnt [{len(nextGames)}]")
        logger.info(f"      cptLeft [{cptLeft}]")
        logger.info(f"      cptRight [{cptRight}]")
        if not nextGames:
            logger.info('   NO NEXT GAME')
            return
        if len(nextGames) == 1:
            currentGame.next_game = nextGames[0]
            currentGame.save()
            return
        
        if (currentGame.id % 2) == 0:
            for nGame in nextGames:
                if nGame.id % 2 == 0 and nGame.id != currentGame.id :
                    if cptLeft <= 2:
                        logger.info(f"      nGame.id [{nGame.id}]")
                        nextGameId = nGame.id
                    else:
                        logger.info(f"      nGame.id  + 2 [{nGame.id + ( count_divisions_by_n(cptLeft, 2) * 2)}]")
                        nextGameId = nGame.id + ( count_divisions_by_n(cptLeft, 2) * 2)
                    break
        else:
            for nGame in nextGames:
                if nGame.id % 2 != 0 and nGame.id != currentGame.id:
                    if cptRight <= 2:
                        logger.info(f"      nGame.id [{nGame.id}]")
                        nextGameId = nGame.id
                    else:
                        logger.info(f"      nGame.id  + 2 [{nGame.id + ( count_divisions_by_n(cptRight, 2) * 2)}]")
                        nextGameId = nGame.id + ( count_divisions_by_n(cptRight, 2) * 2)
                    break
        if nextGameId:
            logger.info(f"      nextGameId [{nextGameId}]")
            currentGame.next_game = Game_Tournament.objects.get(id=nextGameId)
            currentGame.save()
        logger.info('====================> END SET NEXT GAME FOR GAME')
    except Exception as e:
        logger.info(f'   ERROR{e}')
        return Response({"error": str(e)}, status=500)

def setNextGamePerGame(lobby):
    try :
        logger.info('====================> SET NEXT GAME')
        participants = getAllParticipants(lobby)
        nbrParticipants = len(participants)
        DFP = decompositionProduitFactorPremier(nbrParticipants)
        games = Game_Tournament.objects.filter(UUID_TOURNAMENT__UUID_LOBBY=lobby)
        games = games.order_by('id')
        nbrTour = len(DFP)
        gameIndex = games.first().id
        firstGameId = gameIndex

        logger.info(f"  games [{games}]")
        logger.info(f"  nbrParticipants [{nbrParticipants}]")
        logger.info(f"  DFP [{DFP}]")
        logger.info(f"  nbrTour [{nbrTour}]")
        logger.info(f"  gameIndex [{gameIndex}]")

        cptLeft = 0
        cptRight = 0


        for i in range(1, nbrTour):
            nextGames = getAllGamesAtTurn(firstGameId, i + 1, DFP, nbrParticipants)
            nbrGameByTour = get_nbr_party_by_tour(nbrParticipants, i, DFP)
            logger.info(f"  nbr game for [{i}]: {nbrGameByTour}")
            for j in range(nbrGameByTour):
                Currentgame = games.get(id=gameIndex)
                Currentgame.layer = i
                Currentgame.save()
                # logger.info(f"      Currentgame [{Currentgame}]")
                # logger.info(f"      nextGames [{nextGames}]")
                if (Currentgame.id % 2) == 0:
                    cptLeft += 1
                else:
                    cptRight += 1
                setNextGameForGame(Currentgame, nextGames, cptLeft, cptRight)
                gameIndex += 1
            cptLeft = 0
            cptRight = 0
        logger.info('====================> END OF SET NEXT GAME')  
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@login_required
def lockLobby(request):
    try:
        logger.info('====================> LOCK LOBBY')
        logger.info(f"   CALL")
        lobbyUUID = request.data.get('lobbyUUID')
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        lobby.locked = True
        lobby.save()
        if not Tournament.objects.filter(UUID_LOBBY=lobby).exists() or not Game_Tournament.objects.filter(UUID_TOURNAMENT__UUID_LOBBY=lobby).exists():
            Tournament.objects.create(UUID_LOBBY=lobby)
            tournament = Tournament.objects.get(UUID_LOBBY=lobby)
            makeMatchMakingTournament(lobby, tournament.UUID)
            setNextGamePerGame(lobby)
        else:
            tournament = Tournament.objects.get(UUID_LOBBY=lobby)
            setNextGamePerGame(lobby) #A RETIRER
        tournamentOrganized = {}
        tournamentOrganized['UUID'] = tournament.UUID
        tournamentOrganized['games'] = []

        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        for game in games:
            gameData = {}
            gameData['id'] = game.id
            gameData['winner_player'] = game.winner_player.id if game.winner_player else None
            gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
            gameData['next_game'] = game.next_game.id if game.next_game else None
            gameData['layer'] = game.layer
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

@csrf_exempt
@api_view(['GET'])
@login_required
def getTournamentInfo(request):
    try:
        UUID_TOURNAMENT = request.GET.get('tournamentUUID')
        tournament = Tournament.objects.get(UUID=UUID_TOURNAMENT)
        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        games = games.order_by('id')
        tournamentOrganized = {}
        tournamentOrganized['UUID'] = tournament.UUID
        tournamentOrganized['games'] = []

        for game in games:
            gameData = {}
            gameData['id'] = game.id
            gameData['winner_player'] = game.winner_player.id if game.winner_player else None
            gameData['winner_ai'] = game.winner_ai.id if game.winner_ai else None
            gameData['next_game'] = game.next_game.id if game.next_game else None
            gameData['layer'] = game.layer
            gameData['players'] = []
            for player in game.players.all():
                logger.info(player)
                
                gameData['players'].append({
                    'id': player.id,
                    'is_ai': False,
                    'username': player.username,
                    'img': str(player.img)
                })
                
            for ia in game.ai_players.all():
                gameData['players'].append({
                    'id': ia.id,
                    'is_ai': True,
                    'username': 'ia',
                    'img': 'https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp'
                })
            tournamentOrganized['games'].append(gameData)

        return Response({"gameTournament": tournamentOrganized['games']}, status=200)
    except Tournament.DoesNotExist:
        return Response({"error": f"Tournament does not exist for lobby with id {UUID_TOURNAMENT}"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@login_required
def setWinnerAtTournamentGame(request):
    try :
        id = request.data.get('contactId')

        gameId = request.data.get('idGame')
        winnerId = request.data.get('idWinner')
        isAI = request.data.get('isIa')
        game = Game_Tournament.objects.get(id=gameId)
        if isAI == 'True':
            winner = AIPlayer.objects.get(id=winnerId)
            game.winner_ai = winner
        else:
            winner = Player.objects.get(id=winnerId)
            game.winner_player = winner
        game.save()
        nextGame = game.next_game
        if nextGame :
            if isAI == 'True':
                nextGame.ai_players.add(winner)
            else:
                nextGame.players.add(winner)
        return Response({"game": game.id}, status=200)
    except Game_Tournament.DoesNotExist:
        return Response({"error": f"Game with id {gameId} does not exist"}, status=404)
    except Player.DoesNotExist:
        return Response({"error": f"Player with id {winnerId} does not exist"}, status=404)
    except AIPlayer.DoesNotExist:
        return Response({"error": f"AIPlayer with id {winnerId} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def getCurrentLayer(tournament):
    games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
    games = games.order_by('id')
    for game in games:
        if game.winner_ai is None and game.winner_player is None:
            return game.layer
    return -1

@csrf_exempt
@api_view(['GET'])
@login_required
def finishGameOnlyIa(request):
    try:
        logger.info('====================> finishGameOnlyIa')
        lobbyUUID = request.GET.get('lobbyUUID')
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        tournament = Tournament.objects.get(UUID_LOBBY=lobby)
        layer = getCurrentLayer(tournament)
        logger.info(f"   layer [{layer}]")
        games = Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament)
        games = games.filter(layer=layer)
        for game in games:
            if game.players.count() == 0 and game.ai_players.count() == 2:
                logger.info(f"          gameWiniS")
                game.winner_ai = game.ai_players.first()
                game.save()
                nextGame = game.next_game
                if nextGame:
                    nextGame.ai_players.add(game.winner_ai)

        return Response({"message": "All games with only IA player have been finished"}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except tournament.DoesNotExist:
        return Response({"error": f"Tournament with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def getLobbyIsLocked(request):
    try :
        logger.info('====================> GET LOBBY IS LOCKED')
        lobbyUUID = request.GET.get('lobbyUUID')
        logger.info(f"   lobbyUUID [{lobbyUUID}]")
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        logger.info(f"   lobby [{lobby}]")
        logger.info(f"   locked [{lobby.locked}]")
        return Response({"locked": lobby.locked}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
@login_required
def removeLobby(request):
    try :
        lobbyUUID = request.GET.get('lobbyUUID')
        lobby = Lobby.objects.get(UUID=lobbyUUID)
        lobby.delete()
        lobby.save()
        return Response({"message": "Lobby has been deleted"}, status=200)
    except Lobby.DoesNotExist:
        return Response({"error": f"Lobby with id {lobbyUUID} does not exist"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ===============================================================================================
# ============================================ GAME MANDA ============================================
# ===============================================================================================

@api_view(['GET'])
@login_required
def getPongGameForUser(request):
    try:
        userId = request.GET.get('userId')
        player = Player.objects.get(id=userId)
        games = (Game.objects.filter(player1=player, finish=True, type="pong") | Game.objects.filter(player2=player, finish=True, type="pong"))
        games = games.order_by('-created_at')
        
        match_data_list = []
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
                'elo_player1': game.elo_after_player1 - game.elo_before_player1,
                'elo_player2': game.elo_after_player2 - game.elo_before_player2,
            }
            match_data_list.append(match_data)
        return Response({"match_data": match_data_list}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@login_required
def getConnect4GameForUser(request):
    try:
        userId = request.GET.get('userId')
        player = Player.objects.get(id=userId)
        games = (Game.objects.filter(player1=player, finish=True, type="connect4") | Game.objects.filter(player2=player, finish=True, type="connect4"))
        games = games.order_by('-created_at')
        
        match_data_list = []
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
                'elo_player1': game.elo_after_player1 - game.elo_before_player1,
                'elo_player2': game.elo_after_player2 - game.elo_before_player2,
            }
            match_data_list.append(match_data)
        return Response({"match_data": match_data_list}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
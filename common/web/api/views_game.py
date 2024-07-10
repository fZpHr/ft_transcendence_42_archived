# api/views_game.py
from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Player, Request, Friends, Messages, User
from rest_framework.decorators import parser_classes
from rest_framework.parsers import FormParser
from .serializer import LoginEncoder
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout as auth_logout
import requests
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db.models import Case, IntegerField, Sum, When
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.exceptions import ValidationError
from users.models import Profile
from .models import Game


@api_view(['GET'])
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
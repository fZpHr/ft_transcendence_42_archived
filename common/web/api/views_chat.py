from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Player, Request, Friends, Messages, User, GameInvitation
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
from django.views.decorators.csrf import csrf_exempt
from itertools import chain


@api_view(['GET'])
def getChatUser(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        friends = Friends.objects.filter(player_id=player.id, status=3).values_list('friend_id', flat=True)
        chat_users = Player.objects.filter(id__in=friends).values('id', 'username', 'img')
        for chat_user in chat_users:
            chat_user['is_online'] = Player.objects.get(id=chat_user['id']).is_online
        return Response(chat_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def getMessages(request):
    try:
        id = request.GET.get('contactId')
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)

        messages_sent_by_user = Messages.objects.filter(sender=player, receiver=friend).values('sender', 'content', 'created_at')
        messages_received_by_user = Messages.objects.filter(sender=friend, receiver=player).values('sender', 'content', 'created_at')

        for message in chain(messages_sent_by_user, messages_received_by_user):
            message['type'] = 0

        game_invitations_sent = GameInvitation.objects.filter(player1=player, player2=friend).values('player1', 'player2', 'status', 'created_at')

        for invitation in game_invitations_sent:
            invitation['type'] = 1
            invitation['content'] = f"Game invitation from {invitation['player1']} to {invitation['player2']}"

        combined_list = list(messages_sent_by_user) + list(messages_received_by_user) + list(game_invitations_sent)

        combined_list.sort(key=lambda x: x['created_at'])
        return Response(combined_list, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
def sendInvite(request):
    try:
        print("=====================================")
        
        id = request.data.get('contactId')
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)
        print(f"player: {player}, friend: {friend}")
        if GameInvitation.objects.filter(player1=player, player2=friend).exists():
            GameInvitation.objects.filter(player1=player, player2=friend).delete()
        if GameInvitation.objects.filter(player1=friend, player2=player).exists():
            GameInvitation.objects.filter(player1=friend, player2=player).delete()
        GameInvitation.objects.create(player1=player, player2=friend, status=0)
        GameInvitation.objects.create(player1=friend, player2=player, status=1)
        return Response({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def sendMessage(request):
    try:
        print("=====================================")
        
        id = request.data.get('contactId')
        content = request.data.get('message')
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)
        print(f"player: {player}, friend: {friend}, content: {content}")
        Messages.objects.create(sender=player, receiver=friend, content=content)
        return Response({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

def getFriendStatus(player_id, friend_id):
    try:
        f = Friends.objects.get(player_id=player_id, friend_id=friend_id)
    except Friends.DoesNotExist:
        f = None
    if f is None:
        return 0
    return f.status

@api_view(['GET'])
def getSocialUser(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        blocked_users = Friends.objects.filter(player_id=player.id, status=-3).values_list('friend_id', flat=True)
        social_users = Player.objects.exclude(id__in=blocked_users).exclude(id=player.id).values('id', 'username', 'img')
        for social_user in social_users:
            social_user['is_online'] = Player.objects.get(id=social_user['id']).is_online 
            social_user['friend_status'] = getFriendStatus(player.id, social_user['id'])
        
        return Response(social_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def isOnline(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        return Response({"is_online": player.profile.is_online}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def updateSocialStatus(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        SocialUser = request.data.get('socialUserId')
        friend_status = request.data.get('friendStatus')
        try:
            friend_status = int(friend_status)
        except ValueError:
            return Response({"error": "friend_status doit être un entier"}, status=400)
        try:
            SocialUser = int(SocialUser)
        except ValueError:
            return Response({"error": "socialUserId doit être un entier"}, status=400)
        if friend_status == 0:
            if Friends.objects.filter(player_id=player.id, friend_id=SocialUser).exists():
                Friends.objects.filter(player_id=player.id, friend_id=SocialUser).delete()
            if Friends.objects.filter(player_id=SocialUser, friend_id=player.id).exists():
                Friends.objects.filter(player_id=SocialUser, friend_id=player.id).delete()
            Friends.objects.create(player_id=player.id, friend_id=SocialUser, status=1)
            Friends.objects.create(player_id=SocialUser, friend_id=player.id, status=2)
        elif friend_status == 2:
            Friends.objects.filter(player_id=player.id, friend_id=SocialUser).update(status=3)
            Friends.objects.filter(player_id=SocialUser, friend_id=player.id).update(status=3)
        elif friend_status == -1:
            if Friends.objects.filter(player_id=player.id, friend_id=SocialUser).exists():
                Friends.objects.filter(player_id=player.id, friend_id=SocialUser).delete()
            if Friends.objects.filter(player_id=SocialUser, friend_id=player.id).exists():
                Friends.objects.filter(player_id=SocialUser, friend_id=player.id).delete()
        elif friend_status == -2:
            Friends.objects.filter(player_id=player.id, friend_id=SocialUser).update(status=-2)
            Friends.objects.filter(player_id=SocialUser, friend_id=player.id).update(status=-3)
        return Response({"message": "Status updated successfully"}, status=200)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return Response({"error": str(e)}, status=500)

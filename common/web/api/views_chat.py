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

@api_view(['GET'])
def getChatUser(request):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        friends = Friends.objects.filter(player_id=player.id, status=3).values_list('friend_id', flat=True)
        chat_users = Player.objects.filter(id__in=friends).values('id', 'username', 'img')
        return Response(chat_users, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def getMessages(request, id):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)
        messages_sent_by_user = Messages.objects.filter(sender=player, receiver=friend).values('sender', 'content', 'created_at')
        messages_received_by_user = Messages.objects.filter(sender=friend, receiver=player).values('sender', 'content', 'created_at')
        messages = list(messages_sent_by_user) + list(messages_received_by_user)
        messages.sort(key=lambda x: x['created_at'])
        return Response(messages, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

@csrf_exempt
@api_view(['GET'])
def sendMessage(request, id):
    try:
        user = request.user
        player = Player.objects.get(username=user)
        friend = Player.objects.get(id=id)
        content = request.GET.get('message')
        Messages.objects.create(sender=player, receiver=friend, content=content)
        return Response({"message": "Message sent successfully"}, status=200)
    except Player.DoesNotExist:
        return Response({"message": "One of the players does not exist."}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)

@api_view(['GET'])
def getSocialUser(request):
    player_id = request.query_params['id']
    relationships = []

    for p in Player.objects.all():
        try:
            f = Friends.objects.get(player_id=player_id, friend_id=p.id)
        except Friends.DoesNotExist:
            f = None
        try:
            reverse_f = Friends.objects.get(player_id=p.id, friend_id=player_id)
        except Friends.DoesNotExist:
            reverse_f = None
        if (p.img.name.startswith("profile_pics")):
            img = p.img.url
        else:
            img = p.img.name
        if f and f.status == 1:
            relationships.append({'id': p.id, 'username': p.username, 'status': 1, 'img': img})
        elif reverse_f and reverse_f.status == 1:
            relationships.append({'id': p.id, 'username': p.username, 'status': 2, 'img': img})
        elif f and f.status == 3:
            relationships.append({'id': p.id, 'username': p.username, 'status': 3, 'img': img})
        else:
            relationships.append({'id': p.id, 'username': p.username, 'status': 0, 'img': img})
    return JsonResponse(list(relationships), safe=False)


@api_view(['GET'])
def addFriend(request, id):
    status = False
    try:
        name = request.user.username
        user = Player.objects.get(username=name)
        
        player_id = user.id
        friend_id = id

        friend = Player.objects.get(id=friend_id)
        existing_friendship = Friends.objects.filter(player_id=player_id, friend_id=friend_id, status=2).first()
        
        if existing_friendship:
            status = True
            existing_friendship.status = 3
            existing_friendship.save()
            existing_friendship_reverse = Friends.objects.get(player_id=friend_id, friend_id=player_id)
            existing_friendship_reverse.status = 3
            existing_friendship_reverse.save()
        else:
            Friends.objects.get_or_create(player_id=player_id, friend_id=friend_id, defaults={'status': 1})
            Friends.objects.get_or_create(player_id=friend_id, friend_id=player_id, defaults={'status': 2})
        return Response({"message": "Friend added successfully", "status": status}, status=200)
    except Player.DoesNotExist:
        return Response({"error": "Friend not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
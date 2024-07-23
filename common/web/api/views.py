from django.shortcuts import render, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Player, Friends, Messages, User
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
from django.utils.translation import gettext as _
from django.conf import settings
from api.login_required import login_required

# Create your views here.
@login_required
@api_view(['GET'])
def getData(request):
    return Response("")

@login_required
@api_view(['GET'])
def get_me(request):
    user = request.user
    player = Player.objects.get(username=user)
    if (player.img.name.startswith("profile_pics")):
        img = player.img.url
    else:
        img = player.img.name
    return JsonResponse({'id': player.id, 'username': player.username, 'mail': player.mail, 'img': img, 'elo': player.elo})

@login_required
@api_view(['GET'])
def getAllUsers(request):
    u = serializers.serialize('json', Player.objects.all(), fields=('username', 'img'))
    return HttpResponse(u, content_type='application/json')

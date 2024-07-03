# users/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import json

from django.utils.translation import gettext as _

from django.utils.translation import activate
from django.views.decorators.cache import cache_page
from django.contrib.auth.models import User
from api.models import Player

# @cache_page(60 * 15)
def login_view(request):
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    context = {
        'no_footer': True,
        'LANGUAGE_CODE': language_code,
    }
    
    return render(request, 'login/login_view.html', context)

# @cache_page(60 * 15)
def profil_view(request, format=None):
    data = Player.objects.get(username=request.user)
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    isDiv = False
    is42_ = True
    if (data.img.name.startswith("profile_pics")):
        is42_ = False
    if (data.img.name.endswith("default.png") or data.img.name.startswith("profile_pics")):
        isDiv = True
    user_data = {
        'visited': False,
        'username': data.username,
        'mail': data.mail,
        'friends_count': 10,
        'elo': data.elo,
        'avatar_url': data.img,
        'is42': is42_,
        'isDiv': isDiv, 
        'matches': [
            # {'player1': 'User1', 'player2': 'User2', 'time': '10:30', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180},
            # {'player1': 'User1', 'player2': 'User3', 'time': '9:45', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180},
            # {'player1': 'User1', 'player2': 'User5', 'time': '7:15', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180}
        ]
    }
    return render(request, 'profil/profil_view.html', {'user_data': user_data})

def visited_profil_view(request, username):
    data = Player.objects.get(username=username)
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    print(data.img.name)
    if (data.img.name.startswith("profile_pics")):
        is42_ = False
    else:
        is42_ = True
    user_data = {
        'visited': True,
        'username': data.username,
        'friends_count': 10,
        'elo': data.elo,
        'avatar_url': data.img,
        'is42': is42_,
        'matches': [
            # {'player1': 'User1', 'player2': 'User2', 'time': '10:30', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180},
            # {'player1': 'User1', 'player2': 'User3', 'time': '9:45', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180},
            # {'player1': 'User1', 'player2': 'User5', 'time': '7:15', 'winner': 'User1', 'elo_before1': 1260, 'elo_before2': 1200, 'elo_after1': 1280, 'elo_after2': 1180}
        ]
    }
    return render(request, 'profil/profil_view.html', {'user_data': user_data})

# @cache_page(60 * 15)
def progress_view(request):
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    matches = [
        {'date': '2024-06-01', 'elo': 1200},
        {'date': '2024-06-02', 'elo': 1220},
        {'date': '2024-06-03', 'elo': 1210},
        {'date': '2024-06-04', 'elo': 1230},
        {'date': '2024-06-05', 'elo': 1250},
    ]
    matches_json = json.dumps(matches)
    return render(request, 'progress/progress.html', {'matches_json': matches_json, 'no_footer': True})

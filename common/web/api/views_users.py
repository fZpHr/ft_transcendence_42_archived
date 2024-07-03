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
import re
from django.core import files

@api_view(['POST'])
def login_player(request):
    mail = request.POST.get("email")
    password = request.POST.get("pass")
    try:
        player = Player.objects.get(mail=mail)
        user = authenticate(request, username=player.username, password=password)
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect('http://localhost:8000/profil/')
        else:
            messages.error(request, "Invalid e-mail or password,")
            return redirect('http://localhost:8000/login/')
    except Player.DoesNotExist:
        messages.error(request, "Invalid e-mail or password, ")
        print(messages.get_messages(request))
        return redirect('http://localhost:8000/login/')


@api_view(['POST'])
@parser_classes([FormParser])
def register(request, format=None):
    try:
        print("Registering user")
        print(request.POST)
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("pass")
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already in use")
        if User.objects.filter(username=username).exists():
            raise ValidationError("Username already in use")
        if len(password) < 8:
            raise ValidationError("Password too weak. Minimum length is 8 characters.")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', password):
            raise ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain at least one digit.")
        print("Creating user")
        user = User.objects.create_user(username=username, email=email, password=password)
        player = Player.objects.create(username=username, mail=email, password=password)
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return redirect('http://localhost:8000/profil/')
        
    except ValidationError as e:
        messages.error(request, f"Validation Error: {str(e)}")
        return redirect('http://localhost:8000/login/')
    
    except Exception as e:
        messages.error(request, f"An error occurred: {str(e)}")
        return redirect('http://localhost:8000/login/')

def download_file_from_url(url):
    try:
        request = requests.get(url, stream=True)
    except requests.exceptions.RequestException as e:
        return None

    if request.status_code != requests.codes.ok:
        return None
    lf = tempfile.NamedTemporaryFile()
    for block in request.iter_content(1024 * 8):
        if not block:
            break
        lf.write(block)

    return files.File(lf)

@api_view(['GET'])
def register_42(request, format=None):
    body = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-484f3af86d262f1a98fc094a4116618c1c856647f7eb4232272966a9a3e83193",
        "client_secret": "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",
        "code": request.query_params["code"],
        "redirect_uri": "http://localhost:8000/api/register-42/"
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    r = requests.post('https://api.intra.42.fr/oauth/token', headers=headers, json=body)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get('https://api.intra.42.fr/v2/me', headers=headers, json=body)
    mail = r.json()["email"]
    username = r.json()["login"]
    password = token
    try:
        u = User.objects.get(email=mail)
        u.set_password(token)
        u.save()
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    except User.DoesNotExist:
        data = User.objects.create_user(username, mail, password)
        player = Player.objects.create(username=data.username, mail=data.email, password=data.password, img=(r.json()["image"]["link"]))
        data.save()
        user = authenticate(request, username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('http://localhost:8000/profil/')

def logout(request):
    auth_logout(request)
    return redirect('/login/') 

@api_view(['POST'])
def update_img(request):
    if request.method == 'POST' and request.FILES.get('avatar'):
        avatar = request.FILES['avatar']
        user = request.user
        player = Player.objects.get(username=user)
        player.img = avatar
        player.save()
        return Response({'success': True, 'new_avatar_url': player.img.url})
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

@api_view(['POST'])
@csrf_exempt
def update_data(request):
    try:
        print("Changing user")
        print(request.user)
        username = request.POST.get("username")
        email = request.POST.get("email")
        u = User.objects.get(username=request.user)
        p = Player.objects.get(username=request.user)
        if u.email != email:
            if User.objects.filter(email=email).exists():
                raise ValidationError("Email already in use")
        if u.username != username:
            if User.objects.filter(username=username).exists():
                raise ValidationError("Username already in use")
        u.username = username
        p.username = username
        u.email = email
        p.mail = email
        u.save()
        p.save()
    except ValidationError as e:
        messages.error(request, f"Validation Error: {str(e)}")
    except Exception as e:
        messages.error(request, f"An error occurred: {str(e)}")
    return redirect('http://localhost:8000/profil/')

@api_view(['POST'])
@csrf_exempt
def update_pass(request):
    try:
        print("Changing user")
        print(request.user)
        u = User.objects.get(username=request.user)
        p = Player.objects.get(username=request.user)
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        if p.password != old_password:
            raise ValidationError("Wrong Password")
        if old_password == new_password:
            raise ValidationError("Identic Password")
        if new_password != confirm_password:
            raise ValidationError("Confirm not good")
        if len(new_password) < 8:
            raise ValidationError("Password too weak. Minimum length is 8 characters.")
        if not re.search(r'[A-Z]', new_password):
            raise ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', new_password):
            raise ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', new_password):
            raise ValidationError("Password must contain at least one digit.")
        u.set_password(new_password)
        p.password = new_password
        u.save()
        p.save()
        user = authenticate(request, username=u.username, password=new_password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    except ValidationError as e:
        messages.error(request, f"Validation Error: {str(e)}")
    except Exception as e:
        messages.error(request, f"An error occurred: {str(e)}")
    return redirect('http://localhost:8000/profil/')


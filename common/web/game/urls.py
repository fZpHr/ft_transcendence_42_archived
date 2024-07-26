from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('lobby/', views.lobby),
    path('tournament/', views.tournament),
    path('join-game/', views.joinGame),
    # path('start/', views.startGame),
    path('ranked/', views.ranked),
    path('connect4/', views.connect4),
    path('pong3D/', views.pong3D),
    path('game/', views.game),
    path('pongManda/', views.pongManda),
    path('pongCustom/', views.pongCustom),
]
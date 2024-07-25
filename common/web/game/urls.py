from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('lobby/', views.lobby),
    path('tournament/', views.tournament),
    path('join-game/', views.joinGame),
    # path('start/', views.startGame),
    path('pong/', views.pong),
    path('ranked/', views.ranked),
    path('connect4/', views.connect4)
]
from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('start/', views.startGame),
    path('pong/', views.pong)
]
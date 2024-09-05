# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('profil/', views.profil_view, name='profil'),
    path('progress/pong', views.progressPong_view, name='progress'),
    path('progress/connect4', views.progressConnect4_view, name='progress'),
	path('visited_profil/<str:username>/', views.visited_profil_view, name='visited_profil')
]

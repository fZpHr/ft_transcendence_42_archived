# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('profil/', views.profil_view, name='profil'),
    path('progress/', views.progress_view, name='progress'),
	path('visited_profil/<str:username>/', views.visited_profil_view, name='visited_profil')
]

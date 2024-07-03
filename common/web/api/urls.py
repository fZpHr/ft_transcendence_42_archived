from django.urls import path
from . import views
from . import views_users
from . import views_chat
from django.conf import settings
from .models import Player, Friends, Messages
from django.contrib.auth import views as auth_views

# Add URLS for API
urlpatterns = [
    path('', views.getData),
	path('@me/', views.get_me),
    path('getAllUsers/', views.getAllUsers),
]

# Add URLS for users
urlpatterns += [
    path('register-42/', views_users.register_42),
    path('login_player/', views_users.login_player, name='login_player'),
    path('register/', views_users.register),
    path('logout/', views_users.logout, name='logout'),
    path('updateImg/', views_users.update_img, name='update_img'),
    path('updateData/', views_users.update_data, name='update_data'),
    path('updatePass/', views_users.update_pass, name='updatePass'),
]

# Add URLS for chat
urlpatterns += [
	path('addFriend/<int:id>/', views_chat.addFriend),
    path('getSocialUser/', views_chat.getSocialUser),
    path('getChatUser/', views_chat.getChatUser),
    path('getMessages/<int:id>/', views_chat.getMessages),
    path('sendMessage/<int:id>/', views_chat.sendMessage),

]
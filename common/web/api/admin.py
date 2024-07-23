from django.contrib import admin
from .models import Player, Friends, Messages, Game, GameInvitation, Notification, AIPlayer,  Tournament, Game_Tournament

# Register your models here.
admin.site.register(Player)
admin.site.register(Friends)
admin.site.register(Messages)
admin.site.register(Game)
admin.site.register(GameInvitation)
admin.site.register(Notification)
admin.site.register(AIPlayer)
admin.site.register(Tournament)
admin.site.register(Game_Tournament)

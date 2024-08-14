# routing.py
from django.urls import re_path, path
from channels.routing import ProtocolTypeRouter, URLRouter
from . import consumers

# Websocket URL patterns
# Regex pattern for the URL route
websocket_urlpatterns = [
    re_path(r'^ws/game/connect4/(?P<game_id>\d+)/$', consumers.Connect4GameConsumer.as_asgi()),
    re_path(r'^ws/game/ranked/(?P<game_type>\w+)/$', consumers.RankedGameConsumer.as_asgi()),
]
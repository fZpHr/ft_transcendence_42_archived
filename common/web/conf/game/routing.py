# routing.py

from django.urls import re_path
from . import consumers

# Websocket URL patterns
# Regex pattern for the URL route
websocket_urlpatterns = [
    re_path(r'^ws/game/connect4/(?P<game_id>\d+)/$', consumers.Connect4GameConsumer.as_asgi()),
]
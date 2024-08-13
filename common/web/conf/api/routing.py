# your_app/routing.py
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from . import consumers

# websocket_urlpatterns = [
#     path('ws/game/ranked', consumers.RankedGameConsumer.as_asgi()),
# ]

# application = ProtocolTypeRouter({
#     'websocket': URLRouter(websocket_urlpatterns)
# })
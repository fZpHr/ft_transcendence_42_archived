import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            game_websocket_urlpatterns + chat_websocket_urlpatterns
        )
    ),
})
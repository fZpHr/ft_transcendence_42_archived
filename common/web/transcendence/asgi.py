# asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
from chat import routing as chat_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': SessionMiddlewareStack(
        AuthMiddlewareStack(
            URLRouter(
                chat_routing.websocket_urlpatterns
            )
        )
    ),
})

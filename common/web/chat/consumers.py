# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Rejoindre le groupe de la salle
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Marquer l'utilisateur comme en ligne
        await self.mark_user_online(self.scope["user"])

        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe de la salle
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Marquer l'utilisateur comme hors ligne
        await self.mark_user_offline(self.scope["user"])

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Envoyer le message au groupe de la salle
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def mark_user_online(self, user):
        if user.is_authenticated:
            user.profile.is_online = True
            user.profile.save()

    @database_sync_to_async
    def mark_user_offline(self, user):
        if user.is_authenticated:
            user.profile.is_online = False
            user.profile.save()

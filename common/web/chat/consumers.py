import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Game, Lobby, Player, Game_Tournament, Tournament, GameInvitation
import time
import asyncio
import threading
from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import sync_to_async


class NotifConsumer(AsyncWebsocketConsumer):
    
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.room_name = None
            self.room_group_name = None
        
        async def connect(self):
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'notif_{self.room_name}'
    
            print(f"[WebSocket NOTIF] : Connecting to room {self.room_name}")
    
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
    
            await self.accept()
            print(f"[WebSocket NOTIF] : Connection established for room {self.room_name}")
    
        async def disconnect(self, close_code):
            print(f"[WebSocket NOTIF] : Disconnecting from room {self.room_name} with close code {close_code}")
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
        async def receive(self, text_data):
            text_data_json = json.loads(text_data)
            ID_Game = text_data_json['ID_Game']
            UUID_Tournament = text_data_json['UUID_Tournament']
            link = text_data_json['link']
            notifType = text_data_json['notifType']
            userDestination = text_data_json['userDestination']
            print(f"[WebSocket NOTIF] : Received message: {ID_Game} in room {self.room_name}")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notif_message',
                    'notifType': notifType,
                    'ID_Game': ID_Game,
                    'UUID_Tournament' : UUID_Tournament,
                    'link' : link,
                    'userDestination' : userDestination
                }
            )

        async def notif_message(self, event):
            print(f"[WebSocket NOTIF] : Sending message: to room {self.room_name}")

            await self.send(text_data=json.dumps({
                'notifType': event['notifType'],
                'ID_Game': event['ID_Game'],
                'UUID_Tournament' : event['UUID_Tournament'],
                'link' : event['link'],
                'userDestination' : event['userDestination']
            }))


class SocialConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'social_{self.room_name}'

        print(f"[WebSocket SOCIAL] : Connecting to room {self.room_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"[WebSocket SOCIAL] : Connection established for room {self.room_name}")

    async def disconnect(self, close_code):
        print(f"[WebSocket SOCIAL] : Disconnecting from room {self.room_name} with close code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        updateId = text_data_json['updateId']
        senderId = text_data_json['senderId']
        print(f"[WebSocket SOCIAL] : Received updateId: {updateId} in room {self.room_name}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'social_updateId',
                'updateId': updateId,
                'senderId' : senderId
            }
        )

    async def social_updateId(self, event):
        updateId = event['updateId']
        senderId = event['senderId']
        print(f"[WebSocket SOCIAL] : Sending updateId: {updateId} to room {self.room_name}")

        await self.send(text_data=json.dumps({
            'updateId': updateId,
            'senderId' : senderId
        }))

class ChatConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        print(f"[WebSocket CHAT] : Connecting to room {self.room_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"[WebSocket CHAT] : Connection established for room {self.room_name}")

    async def disconnect(self, close_code):
        print(f"[WebSocket CHAT] : Disconnecting from room {self.room_name} with close code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        senderId = text_data_json['senderId']
        contactId = text_data_json['contactId']
        print(f"[WebSocket CHAT] : Received message: {message} in room {self.room_name}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'senderId' : senderId,
                'contactId' : contactId
            }
        )

    async def chat_message(self, event):
        message = event['message']
        senderId = event['senderId']
        contactId = event['contactId']
        print(f"[WebSocket CHAT] : Sending message: {message} to room {self.room_name}")

        await self.send(text_data=json.dumps({
            'message': message,
            'senderId' : senderId,
            'contactId' : contactId
        }))

def get_games(tournament_uuid):
    return list(Game_Tournament.objects.filter(UUID_TOURNAMENT=tournament_uuid))

def get_players(game_id):
    player = Game_Tournament.objects.get(id=game_id).players.all()
    print('============== DEBOG 10 ',player)
    return None

class LobbyConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'lobby_{self.room_name}'

        print(f"[WebSocket LOBBY] : Connecting to room {self.room_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"[WebSocket LOBBY] : Connection established for room {self.room_name}")

    async def disconnect(self, close_code):
        print(f"[WebSocket LOBBY] : Disconnecting from room {self.room_name} with close code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        eventType = text_data_json['eventType']

        if eventType == 'lock_lobby':
            await self.lock_lobby(text_data)
            return

        message = text_data_json['message']
        userId = text_data_json['userId']
        print(f"[WebSocket LOBBY] : Received message: {message} in room {self.room_name}")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'lobby_message',
                'userId' : userId,
                'eventType': eventType,
                'message': message,
            }
        )
    
    async def lobby_message(self, event):
        userId = event['userId']
        eventType = event['eventType']
        message = event['message']

        print(f"[WebSocket LOBBY] : Sending message: {message} to room {self.room_name}")

        await self.send(text_data=json.dumps({
            'userId' : userId,
            'eventType': eventType,
            'message': message,
        }))

    async def lock_lobby(self, text_data):
        text_data_json = json.loads(text_data)
        print(f"[WebSocket LOBBY] : ======== [ETAPE 1] {text_data_json}")
        print(f"[WebSocket LOBBY] : ======== [ETAPE 2] {self.room_name}")

        # Lock the lobby in the database
        lobby = await database_sync_to_async(Lobby.objects.get)(UUID=self.room_name)
        await database_sync_to_async(lobby.lock)()
        print(f"[WebSocket LOBBY] : ======== [ETAPE 3] {lobby.UUID}")

        # Assuming you have logic to create games and determine their URLs
        tournament = await database_sync_to_async(Tournament.objects.get)(UUID_LOBBY=lobby.UUID)
        print(f"[WebSocket LOBBY] : ======== [ETAPE 4] {tournament.UUID}")
        games = await sync_to_async(get_games)(tournament.UUID)
        print(f"[WebSocket LOBBY] : ======== [ETAPE 5] {games}")
        # Create a mapping of players to game URLs
        player_game_urls = {}
        for game in games:
            print(f"[WebSocket LOBBY] : ========= [ETAPE 6.0] {game.id}")
            players = await sync_to_async(get_players)(game.id)
            print(f"[WebSocket LOBBY] : ========= [ETAPE 6.1] {players}")
            print(f"---------------------------------")
            # players = await database_sync_to_async(list)(game.players.all())
            # for player in players:
            #     player_game_urls[player.id] = f'/game/{game.id}/'

    #     # Send the redirection message to all players
    #     for player_id, game_url in player_game_urls.items():
    #         await self.channel_layer.group_send(
    #             self.room_group_name,
    #             {
    #                 'type': 'redirect_message',
    #                 'userId': player_id,
    #                 'eventType': 'redirect',
    #                 'message': game_url,
    #             }
    #         )

    # async def redirect_message(self, event):
    #     userId = event['userId']
    #     eventType = event['eventType']
    #     message = event['message']

    #     if str(self.scope['user'].id) == str(userId):
    #         print(f"[WebSocket LOBBY] : Redirecting user {userId} to {message}")

    #         await self.send(text_data=json.dumps({
    #             'userId': userId,
    #             'eventType': eventType,
    #             'message': message,
    #         }))

class GameConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.reccurs = 0
        self.update_thread	= threading.Thread(target=asyncio.run, args=(self.checkBall(),))
        self.update_thread.start()
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        print(f"[WebSocket GAME] : Connecting to room {self.room_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"[WebSocket GAME] : Connection established for room {self.room_name}")

    async def disconnect(self, close_code):
        print(f"[WebSocket GAME] : Disconnecting from room {self.room_name} with close code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def checkBall(self):
        while True:
            time.sleep(1 / 60)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        userId = text_data_json['userId']
        eventType = text_data_json['eventType']
        message = text_data_json['message']
        print(f"[WebSocket GAME] : Received message: {message} in room {self.room_name}")

        command = message.split(" | ")[1]
        if command == "start":
            self.checkBall()
            return 

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'userId' : userId,
                'eventType': eventType,
                'message': message
            }
        )
    
    async def game_update(self, event):
        userId = event['userId']
        eventType = event['eventType']
        message = event['message']

        print(f"[WebSocket GAME] : Sending message: {message} to room {self.room_name}")

        await self.send(text_data=json.dumps({
            'userId' : userId,
            'eventType': eventType,
            'message': message,
        }))
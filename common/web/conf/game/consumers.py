from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json
import random
from game.Class.engine import Engine
from asgiref.sync import sync_to_async
from api import models
from api.serializer import PlayerSerializer
import asyncio
import logging

logger = logging.getLogger('logger.info')

room_counts = {}
player_colors = {}  # Global dictionary to store player colors

class Connect4GameConsumer(AsyncWebsocketConsumer):
    games = {}
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'connect4_%s' % self.room_name
        if self.room_name not in Connect4GameConsumer.games:
            Connect4GameConsumer.games[self.room_name] = {
                'board': [['' for i in range(7)] for j in range(6)],
                'playerTurn': 'red',
                'gameFinished': False,
                'winner': None,
                'timer': 30,
                'timer_started': False
            }
        if room_counts.get(self.room_group_name, 0) >= 2:
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        logger.info("CONNECT called" + self.room_group_name)

        room_counts[self.room_group_name] = room_counts.get(self.room_group_name, 0) + 1
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        room_counts[self.room_group_name] = room_counts.get(self.room_group_name, 0) - 1

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        logger.info("RECEIVE called")
        logger.info(text_data_json)
        logger.info(self.room_group_name)
        logger.info(self.room_name)
        player_id = text_data_json.get('player_id')
        player = await sync_to_async(models.Player.objects.get)(id=player_id)
        logger.info("player : ", player)

        if room_counts.get(self.room_group_name, 0) != 2:
            logger.info("Error: You are alone!")
            return

        if text_data_json['type'] == "join":
            logger.info("JOIN called")
            roles = ['yellow', 'red']

            if player_id not in player_colors:
                role = random.choice(roles)
                player_colors[player_id] = role
            else:
                if Connect4GameConsumer.games[self.room_name]['gameFinished'] == True:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'reset',
                            'winner': Connect4GameConsumer.games[self.room_name]['winner']
                        }
                    )
                role = player_colors[player_id]

            logger.info("Role: ", role)
            for i in player_colors:
                if i != player.id:
                    opponent = await sync_to_async(models.Player.objects.get)(id=i)
                    break
            if not Connect4GameConsumer.games[self.room_name]['timer_started']:
                asyncio.create_task(self.start_timer()) # Start timer for the game
                Connect4GameConsumer.games[self.room_name]['timer_started'] = True
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'role.giver',
                    'role': role,
                    'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                    'sender': self.channel_name,
                    'playerInfo': player,
                    'opponentInfo': opponent
                }
            )
            return
        if text_data_json['type'] == "reset":
            logger.info("RESET called")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reset',
                    'winner': text_data_json['winner']
                }
            )
            return
        columnSelected = text_data_json['col']
        rowSelected = text_data_json['row']
        currentPlayer = text_data_json['player']
        nextPlayer = 'yellow' if currentPlayer == 'red' else 'red'
        Connect4GameConsumer.games[self.room_name]['playerTurn'] = nextPlayer
        for i in player_colors:
            if i != player.id:
                opponent = await sync_to_async(models.Player.objects.get)(id=i)
                break
        logger.info("OPPONENT: ", opponent)
        Connect4GameConsumer.games[self.room_name]['timer'] = 30
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game.move',
                'column': columnSelected,
                'row': rowSelected,
                'player': text_data_json['player'],
                'playerInfo': player,
                'opponentInfo': opponent,
                'nextTurn': nextPlayer
            }
        )

    async def game_move(self, event):
        logger.info("GAME MOVE called")
        column = event['column']
        row = event['row']
        serializePlayer = PlayerSerializer(event['playerInfo']).data
        serializeOpps = PlayerSerializer(event['opponentInfo']).data
        serializePlayer['img'] = event['playerInfo'].img.name
        serializeOpps['img'] = event['opponentInfo'].img.name
        # modify the board 
        Connect4GameConsumer.games[self.room_name]['board'][row][column] = event['player']
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'column': column,
            'row': row,
            'player': event['player'],
            'playerInfo': serializePlayer,
            'opponentInfo': serializeOpps,
            'next_player': event['nextTurn'],
            'board': Connect4GameConsumer.games[self.room_name]['board']
        }))
        

    async def role_giver(self, event):
        logger.info("Role giver called")
        serializePlayer = PlayerSerializer(event['playerInfo']).data
        serializeOpps = PlayerSerializer(event['opponentInfo']).data
        serializePlayer['img'] = event['playerInfo'].img.name
        serializeOpps['img'] = event['opponentInfo'].img.name
        if self.channel_name != event['sender']:
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': event['role'],
                'playerTurn': event['playerTurn'],
                'board': Connect4GameConsumer.games[self.room_name]['board'],
                'playerInfo': serializePlayer,
                'opponentInfo': serializeOpps
            }))
        else:
            opposite_role = 'red' if event['role'] == 'yellow' else 'yellow'
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': opposite_role,
                'playerTurn': event['playerTurn'],
                'board': Connect4GameConsumer.games[self.room_name]['board'],
                'playerInfo': serializeOpps,
                'opponentInfo': serializePlayer
            }))

    async def reset(self, event):
        logger.info("RESET called")
        Connect4GameConsumer.games[self.room_name]['gameFinished'] = True
        Connect4GameConsumer.games[self.room_name]['winner'] = event['winner']
        await self.send(text_data=json.dumps({
            'type': "reset",
            'winner': event['winner']
        }))

    async def start_timer(self):
        while True:
            await asyncio.sleep(1)
            if Connect4GameConsumer.games[self.room_name]['timer'] > 0:
                Connect4GameConsumer.games[self.room_name]['timer'] -= 1
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'timer_update',
                        'timer': Connect4GameConsumer.games[self.room_name]['timer']
                    }
                )
            else:
                # Handle timeout (e.g., end the game, declare a winner, etc.)
                if Connect4GameConsumer.games[self.room_name]['playerTurn'] == 'red':
                    winner = 'yellow'
                else:
                    winner = 'red'
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'timeout',
                        'winner': winner
                    }
                )
                break

    async def timer_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'timer_update',
            'timer': event['timer']
        }))

    async def timeout(self, event):
        await self.send(text_data=json.dumps({
            'type': 'timeout',
            'winner': event['winner']
        }))

server = Engine()

class GameConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.server = server

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        logger.info(f"[WebSocket GAME] : Connecting to room {self.room_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"[WebSocket GAME] : Connection established for room {self.room_name}")

    async def disconnect(self, close_code):
        logger.info(f"[WebSocket GAME] : Disconnecting from room {self.room_name} with close code {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        userId = text_data_json['userId']
        eventType = text_data_json['eventType']
        message = text_data_json['message']
        logger.info(f"[WebSocket GAME] : Received message: {message} in room {self.room_name}")

        command = message.split(" | ")[1]
        if command == "start":
            # self.server.checkBall()
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

        logger.info(f"[WebSocket GAME] : Sending message: {message} to room {self.room_name}")

        await self.send(text_data=json.dumps({
            'userId' : userId,
            'eventType': eventType,
            'message': message,
        }))

class RankedGameConsumer(AsyncWebsocketConsumer):
    waiting_list = []
    playing_list = []
    async def connect(self):
        logger.info("CONNECTED")
        await self.accept()

    async def disconnect(self, close_code):
        for i in range(len(RankedGameConsumer.waiting_list)):
            if RankedGameConsumer.waiting_list[i]['socket'] == self:
                RankedGameConsumer.waiting_list.pop(i)
                break
        pass
        for i in range(len(RankedGameConsumer.playing_list)):
            if RankedGameConsumer.playing_list[i]['socket'] == self:
                await RankedGameConsumer.playing_list[i]['socket_opps'].send(text_data=json.dumps({
                    'type': 'opponentDisconnected'
                }))
                RankedGameConsumer.playing_list.pop(i)
                break

    async def receive(self, text_data):
        logger.info("RECEIVED")
        text_data_json = json.loads(text_data)
        message = text_data_json['action']
        if text_data_json['action'] == 'heartbeat':
            return
        player = await sync_to_async(models.Player.objects.get)(id = text_data_json.get('player_id'))
        if (len(RankedGameConsumer.waiting_list) > 0 and 
            any(entry["player"] == player for entry in RankedGameConsumer.waiting_list)):
            await self.send(text_data=json.dumps({
                'type': 'alreadyInQueue',
                'message': 'You are already in queue'
            }))
            return
        if (len(RankedGameConsumer.waiting_list) == 0):
            self.waiting_list.append({"socket": self, "player":player})
            return 
        if (len(RankedGameConsumer.waiting_list) > 0):
            opps = RankedGameConsumer.waiting_list[0]['player']
            game = await sync_to_async(models.Game.objects.create)(
                player1 = player, 
                player2 = opps, 
                elo_before_player1 = player.elo,
                elo_before_player2 = opps.elo,
                elo_after_player1 = player.elo,
                elo_after_player2 = opps.elo,
                winner = opps,
                type = text_data_json.get('game_type'))
            serializePlayer = PlayerSerializer(player).data
            serializePlayer['img'] = player.img.name
            serializeOpps = PlayerSerializer(opps).data
            serializeOpps['img'] = opps.img.name
            logger.info(serializePlayer['img'])
            await RankedGameConsumer.waiting_list[0]['socket'].send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializeOpps,
                'opponent': serializePlayer,
                'game_id': game.id,
                'game_type': game.type
            }))
            await self.send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializePlayer,
                'opponent': serializeOpps,
                'game_id': game.id,
                'game_type': game.type
            }))
            self.playing_list.append({"socket": self.waiting_list[0]['socket'], "player": opps, "opponent": player, "socket_opps": self, "game": game})
            self.playing_list.append({"socket": self, "player": player, "opponent": opps, "socket_opps": RankedGameConsumer.waiting_list[0]['socket'], "game": game})
            RankedGameConsumer.waiting_list.pop(0)
            return
        return
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
import hashlib
from django.utils import timezone

logger = logging.getLogger('print')

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
                'timer_started': False,
                'game_id': self.room_name,
                'player1': None,
                'player2': None
            }
        if room_counts.get(self.room_group_name, 0) >= 2:
            await self.send(text_data=json.dumps({
                'type': 'roomFull'
            }))
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        logger.info("CONNECT called")
        logger.info(self.room_group_name)

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
        logger.info("player : ")
        logger.info(str(player))

        if text_data_json['type'] == "join":
            logger.info("JOIN called")
            roles = ['yellow', 'red']

            if Connect4GameConsumer.games[self.room_name]['player1'] is None:
                role = random.choice(roles)
                player_colors[player_id] = role
                Connect4GameConsumer.games[self.room_name]['player1'] = {'player_id': player_id,'color': role}
                await self.send(text_data=json.dumps({
                    'type': 'roleGiving',
                    'role': role,
                    'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                    'board': Connect4GameConsumer.games[self.room_name]['board'],
                    'playerInfo': PlayerSerializer(player).data,
                    'opponentInfo': None
                }))
            elif Connect4GameConsumer.games[self.room_name]['player2'] is None:
                color = Connect4GameConsumer.games[self.room_name]['player1']['color']
                role = 'yellow' if color == 'red' else 'red'
                opponent = await sync_to_async(models.Player.objects.get)(id=Connect4GameConsumer.games[self.room_name]['player1']['player_id'])
                Connect4GameConsumer.games[self.room_name]['player2'] = {'player_id': player_id, 'color': role}
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'role.giver',
                    'role': role,
                    'playerTurn': Connect4GameConsumer.games[self.room_name]['playerTurn'],
                    'sender': self.channel_name,
                    'board': Connect4GameConsumer.games[self.room_name]['board'],
                    'playerInfo': player,
                    'opponentInfo': opponent
                }
            )
            if not Connect4GameConsumer.games[self.room_name]['timer_started']:
                asyncio.create_task(self.start_timer()) # Start timer for the game
                Connect4GameConsumer.games[self.room_name]['timer_started'] = True
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
        logger.info("OPPONENT: ")
        logger.info(opponent)
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
        serializeOpps = PlayerSerializer(event['opponentInfo']).data
        serializePlayer = PlayerSerializer(event['playerInfo']).data
        logger.info("OPPS:")
        logger.info(str(serializeOpps))
        logger.info("PLAYER:")
        logger.info(str(serializePlayer))
        logger.info(event['sender'])
        serializePlayer['img'] = event['playerInfo'].img.name
        serializeOpps['img'] = event['opponentInfo'].img.name
        if self.channel_name == event['sender']:
            logger.info("player role giving")
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': event['role'],
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'playerInfo': serializePlayer,
                'opponentInfo': serializeOpps
            }))
        else:
            logger.info("opponent role giving")
            opposite_role = 'red' if event['role'] == 'yellow' else 'yellow'
            await self.send(text_data=json.dumps({
                'type': "roleGiving",
                'role': opposite_role,
                'playerTurn': event['playerTurn'],
                'board': event['board'],
                'playerInfo': serializeOpps,
                'opponentInfo': serializePlayer
            }))

    async def reset(self, event):
        logger.info("RESET called")
        Connect4GameConsumer.games[self.room_name]['gameFinished'] = True
        Connect4GameConsumer.games[self.room_name]['winner'] = event['winner']
        gameid = Connect4GameConsumer.games[self.room_name]['game_id'] # self.room_name
        player1 = Connect4GameConsumer.games[self.room_name]['player1']
        player2 = Connect4GameConsumer.games[self.room_name]['player2']
        game = await sync_to_async(models.Game.objects.get)(UUID=gameid)
        player1DB = await sync_to_async(models.Player.objects.get)(id=player1['player_id'])
        if player2 is not None:
            player2DB = await sync_to_async(models.Player.objects.get)(id=player2['player_id'])
        else:
            player2DB = await sync_to_async(lambda: game.player2)()
        if event['winner'] == player1['color']:
            player1DB.eloConnect4 += 10 * (1 - ((2 ** (player1DB.eloConnect4/ 100)) / ((2 ** (player1DB.eloConnect4/ 100)) + (2 ** (player2DB.eloConnect4/ 100)))))
            player2DB.eloConnect4 += 10 * (0 - ((2 ** (player2DB.eloConnect4/ 100)) / ((2 ** (player2DB.eloConnect4/ 100)) + (2 ** (player1DB.eloConnect4/ 100)))))
            game.winner = player1DB
        else:
            player1DB.eloConnect4 += 10 * (0 - ((2 ** (player1DB.eloConnect4/ 100)) / ((2 ** (player1DB.eloConnect4/ 100)) + (2 ** (player2DB.eloConnect4/ 100)))))
            player2DB.eloConnect4 += 10 * (1 - ((2 ** (player2DB.eloConnect4/ 100)) / ((2 ** (player2DB.eloConnect4/ 100)) + (2 ** (player1DB.eloConnect4/ 100)))))
            game.winner = player2DB
        game.elo_after_player1 = player1DB.eloConnect4
        game.elo_after_player2 = player2DB.eloConnect4
        game.finish = True
        game.time = (int)((timezone.now() - game.created_at).total_seconds())
        logger.info("WINNER: ")
        logger.info(event['winner'])
        if event['winner'] == player1['color']:
            logger.info(player1DB.eloConnect4)
        elif event['winner'] == player2['color']:
            logger.info(player2DB.eloConnect4)
        await sync_to_async(game.save)()
        await sync_to_async(player1DB.save)()
        await sync_to_async(player2DB.save)()
        await self.send(text_data=json.dumps({
            'type': "reset",
            'winner': event['winner']
        }))

    async def start_timer(self):
        while True:
            if Connect4GameConsumer.games[self.room_name]['gameFinished']:
                break
            await asyncio.sleep(1)
            if Connect4GameConsumer.games[self.room_name]['timer'] > 0:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'timer_update',
                        'timer': Connect4GameConsumer.games[self.room_name]['timer']
                    }
                )
                Connect4GameConsumer.games[self.room_name]['timer'] -= 1
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
        self.room_name = self.scope['url_route']['kwargs']['game_id']
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
        # logger.info(f"[WebSocket GAME] : Received message: {message} in room {self.room_name}")

        command = message.split(" | ")[1]
        if command == "start" and (self.server.players.__len__() == 2) and (self.server.state == "waiting"):
            logger.info(f"=======================================\nreceived start from game {self.server.players.__len__()}")
            self.server.ws = self
            self.server.state = "playing"
            self.server.thread.start()
            return 
        
        if command == "info":
            # logger.info(f"received info from game {self.server.players[0]} - {userId}")
            if userId == self.server.players[0]:
                self.server.ball.pos.x = float(message.split(' | ')[2])
                self.server.ball.pos.y = float(message.split(' | ')[3])
                self.server.ball.acc.x *= -1
                await self.server.sendtoPlayers(json.dumps({"x": self.server.ball.acc.x, "y": self.server.ball.acc.y, "start": False}), "moveBall")
            return
        
        if command == "reset":
            if userId == self.server.players[0]:
            # logger.info(f"received reset from game {self.server.players[0]} - {userId}")
                self.server.ball.pos.x = 0
                self.server.ball.pos.y = 0
                self.server.ball.acc.x = 0.1
                self.server.ball.acc.y = 0
                await self.server.sendtoPlayers(json.dumps({"x": self.server.ball.acc.x, "y": self.server.ball.acc.y, "start": False}), "resetBall")   
            return
		
        if command == "ready":
            self.server.players.append(userId)
            logger.info(f"received ready from game {self.server.players.__len__()}")
            for player in self.server.players:
                logger.info(f"player: {player}")
            # return 

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

        # logger.info(f"[WebSocket GAME] : Sending message: {message} to room {self.room_name} to user {userId}")

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
            if (text_data_json.get('game_type') == 'pong'):
                game = await sync_to_async(models.Game.objects.create)(
                    player1 = player, 
                    player2 = opps, 
                    elo_before_player1 = player.eloPong,
                    elo_before_player2 = opps.eloPong,
                    elo_after_player1 = player.eloPong,
                    elo_after_player2 = opps.eloPong,
                    winner = opps,
                    type = text_data_json.get('game_type'))
            else:
                game = await sync_to_async(models.Game.objects.create)(
                    player1 = player, 
                    player2 = opps, 
                    elo_before_player1 = player.eloConnect4,
                    elo_before_player2 = opps.eloConnect4,
                    elo_after_player1 = player.eloConnect4,
                    elo_after_player2 = opps.eloConnect4,
                    winner = opps,
                    type = text_data_json.get('game_type'))
            # game_id_hash = hashlib.sha256(str(game.id).encode()).hexdigest()
            # game.id = game_id_hash
            serializePlayer = PlayerSerializer(player).data
            serializePlayer['img'] = player.img.name
            serializeOpps = PlayerSerializer(opps).data
            serializeOpps['img'] = opps.img.name
            logger.info(serializePlayer['img'])
            await RankedGameConsumer.waiting_list[0]['socket'].send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializeOpps,
                'opponent': serializePlayer,
                'game_id': str(game.UUID),
                'game_type': game.type
            }))
            await self.send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializePlayer,
                'opponent': serializeOpps,
                'game_id': str(game.UUID),
                'game_type': game.type
            }))
            self.playing_list.append({"socket": self.waiting_list[0]['socket'], "player": opps, "opponent": player, "socket_opps": self, "game": game})
            self.playing_list.append({"socket": self, "player": player, "opponent": opps, "socket_opps": RankedGameConsumer.waiting_list[0]['socket'], "game": game})
            RankedGameConsumer.waiting_list.pop(0)
            return
        return
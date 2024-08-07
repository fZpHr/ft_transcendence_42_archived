# your_app/consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
import api.models as models
from api.serializer import PlayerSerializer
from django.core import serializers

class RankedGameConsumer(WebsocketConsumer):
    waiting_list = []
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        # aller chercher le joueur dans la liste d'attente et le retirer
        for i in range(len(RankedGameConsumer.waiting_list)):
            if RankedGameConsumer.waiting_list[i]['socket'] == self:
                RankedGameConsumer.waiting_list.pop(i)
                break
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['action']
        if text_data_json['action'] == 'heartbeat':
            return
        if (len(RankedGameConsumer.waiting_list) > 0 and self in RankedGameConsumer.waiting_list):
            return
        player = models.Player.objects.get(id = text_data_json.get('player_id'))
        if (len(RankedGameConsumer.waiting_list) == 0):
            self.waiting_list.append({"socket": self, "player":player})
            return 
        if (len(RankedGameConsumer.waiting_list) > 0):
            opps = RankedGameConsumer.waiting_list[0]['player']
            game = models.Game.objects.create(player1 = player, player2 = opps, elo_before_player1 = player.elo, elo_before_player2 = opps.elo, elo_after_player1 = player.elo, elo_after_player2 = opps.elo, winner = opps)
            serializePlayer = PlayerSerializer(player).data
            serializePlayer['img'] = player.img.name
            serializeOpps = PlayerSerializer(opps).data
            serializeOpps['img'] = opps.img.name
            print(serializePlayer['img'])
            if len(RankedGameConsumer.waiting_list) > 0:
                RankedGameConsumer.waiting_list[0]['socket'].send(text_data=json.dumps({
                    'type': 'matchFound',
                    'player': serializeOpps,
                    'opponent': serializePlayer,
                    'game_id': game.id,
                    'game_type': game.type
                }))
                RankedGameConsumer.waiting_list.pop(0)
            return self.send(text_data=json.dumps({
                'type': 'matchFound',
                'player': serializePlayer,
                'opponent': serializeOpps,
                'game_id': game.id,
                'game_type': game.type
            }))
        return
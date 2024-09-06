import json
import random
import time
import asyncio
import threading
import logging
from .ball import Ball
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger('print')
class Engine:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.thread	= threading.Thread(target=asyncio.run, args=(self.checkBall(),))
        self.thread.start()
        self.ball = Ball()
        self.players = []
        self.ws = None
        self.state = "waiting"

    async def sendtoPlayers(self, message, eventType):
        for player in self.players:
            await self.ws.channel_layer.group_send(
                self.ws.room_group_name,
                {
                    'type': 'game_update',
                    'userId' : player,
                    'eventType': eventType,
                    'message': message
                }
            )
        

    async def moveBall(self):
            self.ball.pos.x += 0.01
            await self.sendtoPlayers(self.ball.pos.x, "moveBall")
    
	
    async def checkBall(self):
        logger.info("ici")
        while True:
            if self.state == "waiting":
                continue
            await self.moveBall()
            time.sleep(1 / 60)
            # time.sleep(2)
            
import uuid
import asyncio

class AIPong:
    def __init__(self, original_channel_name, consumer):
        logger.info(f"[AI] Init AIPong")
        self.channel_name = f"{original_channel_name}_ai_{uuid.uuid4()}"
        self.consumer = consumer
        self.channel_layer = get_channel_layer()
        self.room_group_name = consumer.room_group_name
        # Schedule the send_message coroutine to run in the event loop

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        # Schedule the send_message coroutine to run in the event loop
        if data.get('eventType') == 'ping':
            return
        
        movetype = random.choice(['up', 'down'])

        await self.consumer.receive(text_data=json.dumps({
            'userId': '-1',
            'eventType': 'move',
            'message': '-1 | up'
        }))
        await asyncio.sleep(1 / 100)
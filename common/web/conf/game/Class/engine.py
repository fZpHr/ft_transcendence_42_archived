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
            logger.info(f"send to {player}")
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
            logger.info("move ball")
            self.ball.pos.x += 0.01
            await self.sendtoPlayers(self.ball.pos.x, "moveBall")
    
	
    async def checkBall(self):
        logger.info("ici")
        while True:
            if self.state == "waiting":
                continue
            logger.info("==================================================")
            await self.moveBall()
            time.sleep(1 / 60)
            # time.sleep(2)
            
class AIPong:
    def __init__(self, channel_name, consumer):
        logger.info("AI Pong created")
        self.channel_name = channel_name
        self.consumer = consumer
        self.channel_layer = get_channel_layer()
        self.room_group_name = consumer.room_group_name
        # Schedule the send_message coroutine to run in the event loop
        asyncio.create_task(self.send_message("Hello la team"))

    def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        logger.info(f"[AIIIIIIIIIIIIIIIIIIIII] Received message: {message}")
        print(f"Received message: {message}")
        # Schedule the send_message coroutine to run in the event loop
        asyncio.create_task(self.send_message("Hello la team"))

    async def send_message(self, message):
        logger.info(f"Sending message: {message}")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'message': message
            }
        )


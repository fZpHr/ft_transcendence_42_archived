import time
import asyncio
import threading
import logging
from .ball import Ball
import json


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
            # logger.info(f"send to {player}")
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
            # logger.info("move ball")
            await self.sendtoPlayers(json.dumps({"x": self.ball.acc.x, "y": self.ball.acc.y}), "moveBall")
    
    async def checkCollision(self):
        logger.info("check collision")
         
	
    async def checkBall(self):
        logger.info("ici")
        self.ball.acc.x = 0.1
        self.ball.acc.y = 0
        while True:
            if self.state == "waiting":
                continue
            # logger.info("==================================================")
            await self.moveBall()
            await self.checkCollision()
            time.sleep(1 / 60)
            # time.sleep(2)
            
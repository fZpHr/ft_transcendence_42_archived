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
        self.ball = Ball()
        self.players = []
        self.radius = 40
        self.ws = None
        self.state = "waiting"

    async def sendtoPlayers(self, message, eventType):
        for player in self.players:
            # logger.info(f"send to {player} {message}")
            await self.ws.channel_layer.group_send(
            self.ws.room_group_name,
            {
                'type': 'game_update',
                'userId' : player,
                'eventType': eventType,
                'message': message
            }
        )
    
    async def checkCollision(self):
        distanceFromCenter = float(self.ball.pos.x * self.ball.pos.x + self.ball.pos.y * self.ball.pos.y) ** 0.5
        logger.info(f"distanceFromCenter: {distanceFromCenter}")
        logger.info(f"pos {self.ball.pos.x}, {self.ball.pos.y}")
        if distanceFromCenter + self.ball.radius >= self.radius:
            await self.sendtoPlayers(json.dumps({"x": self.ball.acc.x, "y": self.ball.acc.y, "start": False}), "moveBall")
            # self.ball.bounce(self)
            self.ball.acc.x *= -1
        # if self.ball.pos.x > 20:
        #     self.ball.acc.x *= -1
        #     await self.sendtoPlayers(json.dumps({"x": self.ball.acc.x, "y": self.ball.acc.y}), "moveBall")
        # if self.ball.pos.x < -20:
        #     self.ball.acc.x *= -1
        #     await self.sendtoPlayers(json.dumps({"x": self.ball.acc.x, "y": self.ball.acc.y}), "moveBall")
         
	
    async def checkBall(self):
        logger.info("ici")
        self.ball.acc.x = 0.1
        self.ball.acc.y = 0
        self.ball.pos.x = 0
        self.ball.pos.y = 0
        await self.sendtoPlayers(json.dumps({"x": 0, "y": 0, "start": True}), "moveBall")
        time.sleep(5)
        await self.sendtoPlayers(json.dumps({"x": self.ball.acc.x, "y": self.ball.acc.y, "start": False}), "moveBall")
        while True:
            self.ball.pos.x += self.ball.acc.x
            self.ball.pos.y += self.ball.acc.y
            await self.checkCollision()
            # logger.info("==================================================")
            time.sleep(1 / 45)
            
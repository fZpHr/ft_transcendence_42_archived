import time
import asyncio
import threading
import logging
from .ball import Ball

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
            time.sleep(1 / 25)
            # time.sleep(2)
            
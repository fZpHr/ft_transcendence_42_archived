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


    async def moveBall(self):
            self.ball.pos.x += 0.5
    
	
    async def checkBall(self):
        logger.info("ici")
        while True:
            logger.info("==================================================")
            # time.sleep(1 / 60)
            time.sleep(500)
            
import time
import asyncio
import threading
from .ball import Ball


class Engine:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.thread	= threading.Thread(target=asyncio.run, args=(self.checkBall(),))
        self.thread.start()
        self.ball = Ball()
    
    async def moveBall(self):
            self.ball.pos.x += 0.5
            
    
	
    async def checkBall(self):
        while True:
            # print("==================================================")
            time.sleep(1 / 60)
            
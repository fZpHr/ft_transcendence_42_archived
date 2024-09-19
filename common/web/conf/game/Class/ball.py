from .vector import Vector
import math
import random

def abs(x):
    return -x if x < 0 else x

class Ball:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.pos: 		Vector = Vector(0, 0)
        self.acc: 		Vector = Vector(0, 0)
        self.radius: 	float = 0.5
    
    def __str__(self):
        return f"pos: {self.pos} acc: {self.acc} radius: {self.radius}"
    
    def bounce(self, ground):
        normal = self.pos.normalize()
        dotProduct = self.acc.dot(normal)
        newVelocity = self.acc.sub(normal.multiplyScalar(abs(dotProduct * (2.05))))
        newVelocity.x += abs(random.random() * 0.4 - 0.2)
        newVelocity.y += abs(random.random() * 0.4 - 0.2)
        self.acc = newVelocity
        self.pos = normal.multiplyScalar(ground.radius - self.radius)
        return self


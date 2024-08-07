from .vector import Vector

class Ball:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.pos: 		Vector = Vector(0, 0)
        self.acc: 		Vector = Vector(0, 0)
    
    

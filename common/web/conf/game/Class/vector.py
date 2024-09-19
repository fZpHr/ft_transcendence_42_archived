import math

class Vector:
      def __init__(self, x, y):
        self.x = x
        self.y = y

      def normalize(self):
         length = math.sqrt(self.x * self.x + self.y * self.y)
         return Vector(self.x / length, self.y / length)
      
      def dot(self, v):
         return self.x * v.x + self.y * v.y
      
      def sub(self, v):
          return Vector(self.x - v.x, self.y - v.y)
      
      def multiplyScalar(self, scalar):
          return Vector(self.x * scalar, self.y * scalar)
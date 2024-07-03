from rest_framework import serializers
from .models import Player
from django.core.serializers.json import DjangoJSONEncoder

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model=Player
        fields = ['username', 'nickname', 'password']

class LoginEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Player):
            return str(obj)
        return super().default(obj)
        
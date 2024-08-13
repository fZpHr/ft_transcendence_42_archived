# your_app/consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
import api.models as models
from api.serializer import PlayerSerializer
from django.core import serializers

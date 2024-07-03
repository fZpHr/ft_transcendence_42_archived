from django.contrib import admin
from .models import Player, Friends, Messages

# Register your models here.
admin.site.register(Player)
admin.site.register(Friends)
admin.site.register(Messages)
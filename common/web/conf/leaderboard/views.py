
import time
from django.shortcuts import render, redirect
from django.conf import settings
from api.models import Player, Game
from django.utils.translation import activate

# ======================== Decorateur Validator ============================

def login_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(settings.LOGIN_URL)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# =============================================================================

@login_required
def leaderboard(request):
    language_code = request.session.get('django_language', 'en')
    activate(language_code)
    allPlayer = Player.objects.all().order_by('eloPong').values().reverse()[:10]
    # allPlayer = Player.objects.none() 
    for player in allPlayer:
        if not 'http' in player['img']:
            player['img'] = settings.MEDIA_URL + player['img']
    context = {
        'leaderboard': allPlayer,
    }
    if (request.htmx):
        print('htmx')
        return render(request, 'leaderboard/leaderboard.html', context)
    print('no htmx')
    return render(request, 'leaderboard/leaderboard_full.html', context)

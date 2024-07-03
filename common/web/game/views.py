from django.shortcuts import render, redirect

# Create your views here.
def startGame(request):
    return redirect("http://localhost:8000/game/pong")


def pong(request):
    return render(request, "game/game.html")
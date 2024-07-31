import { startGame, movePaddles } from '/static/pong3D/js/remote/pong3D.js';
import { Game } from '/static/pong3D/js/remote/class/games.js'

let p1Ready = false;
let p2Ready = false;
let gameStart = false;
let p1Id;
let p2Id;
let game;

document.addEventListener('DOMContentLoaded', async function () {
    toggleCustomGame();
    toggleMakeReady();

    p1Id = document.getElementById('first-player').getAttribute('data-id');
    p2Id = document.getElementById('second-player').getAttribute('data-id');
    let roomName = p1Id < p2Id ? p1Id + p2Id : p2Id + p1Id;
    roomName = await APIgetHashRoom('game_' + roomName);
    await connectWsGame(roomName.roomName);
});

async function sendToWsGame(eventType, msg) {
    try {
        let data = {
            userId: userId,
            eventType: eventType,
            message: msg
        };
        wssGame.send(JSON.stringify(data));
    } catch (error) {
        console.error(error);
    }
}

async function setUserToLog() {
    try {
        let secondPlayerBox = document.getElementById('second-player');
        secondPlayerBox.querySelector('.player-box__username').classList.remove('notLog');
        let loaderContainer = document.getElementById('loader-container').style.display = 'none';
        let readyBtn = document.getElementById('ready-game');
        readyBtn.classList.add('active');
    } catch (error) {
        console.error(error);
    }
}

async function setUserToLogout() {
    try {
        let secondPlayerBox = document.getElementById('second-player');
        secondPlayerBox.querySelector('.player-box__username').classList.add('notLog');
        let loaderContainer = document.getElementById('loader-container').style.display = 'flex';
        let readyBtn = document.getElementById('ready-game');
        readyBtn.classList.remove('active');
        p1Ready = false;
        p2Ready = false;
        let boxP2Status = document.getElementById('p2_status');
        boxP2Status.innerHTML = 'Not Ready';
        let boxP1Status = document.getElementById('p1_status');
        boxP1Status.innerHTML = 'Not Ready';
        let btn = document.getElementById('ready-game');
        btn.style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}


let wssGame = null;

async function handleWsGameMessage(data) {
    try {
        if (data.userId === userId) {
            return;
        }
        let eventTypes = {
            'ping': ping,
            'pong': pong,
            'leave': leave,
            'ready': ready, // prevenir lautre que on est pres
            'move': move, // envoie deplacement {up, down} a laute
            'start': start, // commencer le jeu (pas utiliser ni utils pour le moment)
            'moveBall': moveBall, // deplacement de la balle pas encore fait 
            'end': end
        }; // pas impelementer
        eventTypes[data.eventType](data);
    } catch (error) {
        console.error(error);
    }
}

async function connectWsGame(roomName) {
    try {
        wssGame = new WebSocket(`wss://${window.location.host}/ws/game/${roomName}/`);

        wssGame.onopen = function (event) {
            let msg = userId + ' | ping';
            sendToWsGame('ping', msg);
        };

        wssGame.onmessage = function (event) {
            let data = JSON.parse(event.data);
            // console.log(data)
            handleWsGameMessage(data);
        };

        wssGame.onclose = function (event) {
            console.log('[WS-g] => is closed now.');
        };

        wssGame.onerror = function (event) {
            console.error('[WS-G] => error observed:', event);
        };

        //  
    } catch (error) {
        console.error(error);
    }
}

// ===============================================================
// ========================= WS Actions =========================
// ===============================================================

// ######### FOR INIT Game #########

async function ping(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');

        let msg = userId + ' | pong';
        sendToWsGame('pong', msg);
        setUserToLog();
    } catch (error) {
        console.error(error);
    }
}

async function pong(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
        setUserToLog();
    } catch (error) {
        console.error(error);
    }
}

async function ready(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
        let boxP2Status = document.getElementById('p2_status');
        boxP2Status.innerHTML = 'Ready';
        p2Ready = true;
        if (p1Ready && p2Ready) {
            startInstance();
        }
    } catch (error) {
        console.error(error);
    }
}

async function leave(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
        if (!gameStart) {
            setUserToLogout();
        } else {
            console.log('You win');
        }
    } catch (error) {
        console.error(error);
    }
}

// ######### FOR Game #########

async function start(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
    } catch (error) {
        console.error(error);
    }
}

async function end(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
    } catch (error) {
        console.error(error);
    }
}

// ######### FOR GAMEPLAY #########

async function move(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
        movePaddles(game, data.message.split(' | ')[0], data.message.split(' | ')[1]);
    } catch (error) {
        console.error(error);
    }
}

async function moveBall(data) {
    try {
        console.log('[WS-G]=>(' + data.message + ')');
    } catch (error) {
        console.error(error);
    }
}

// ================== TOGGLE MODAL ================== //

async function toggleCustomGame() {
    try {
        let customGame = document.getElementById('curstom-game');

        customGame.addEventListener('click', function () {
            console.log('click custom game');
        });
    } catch (error) {
        console.error(error);
    }
}

async function toggleMakeReady() {
    try {
        let startGameBox = document.getElementById('ready-game');

        startGameBox.addEventListener('click', function () {
            let boxP1Status = document.getElementById('p1_status');
            boxP1Status.innerHTML = 'Ready';
            let readyGame = document.getElementById('ready-game');
            readyGame.style.display = 'none';
            p1Ready = true;
            if (p1Ready && p2Ready) {
                console.log("cdc")
                startInstance();
                let msg = userId + ' | start';
                sendToWsGame('start', msg);
            }
            let msg = userId + ' | ready';
            sendToWsGame('ready', msg);
        });
    } catch (error) {
        console.error(error);
    }
}

// ================== GAME ================== //


async function startInstance() {
    try {
        console.log('toggleGame');

        let box = document.getElementById('container-pong3D');
        let footer = document.getElementById('footer');
		let players = document.getElementById('lst-players').getAttribute('data-players').split(',');
        footer.style.display = 'none';
        box.innerHTML = '';
        gameStart = true;
        game = new Game();
        console.log(p1Id, p2Id, userId)
        startGame([{ id: parseInt(players[0]) }, { id: parseInt(players[1]) }], game, {userId});
        // toggleMovePlayer(userId);
    } catch (error) {
        console.error(error);
    }
}

export {
    sendToWsGame
}
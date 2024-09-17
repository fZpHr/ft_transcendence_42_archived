// ======================= Connection =======================

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
            'end': end }; // pas impelementer
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
            console.log(data)
            handleWsGameMessage(data);
        };

        wssGame.onclose = function (event) {
            console.log('[WS-g] => is closed now.');
        };

        wssGame.onerror = function (event) {
            console.error('[WS-G] => error observed:', event);
        };

    } catch (error) {
        console.error(error);
    }
}
// ========================= WS Utils =========================

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
        console.log('[WS-G]=>('+ data.message + ')');
        let boxP2Status = document.getElementById('p2_status');
        boxP2Status.innerHTML = 'Ready';
        p2Ready = true;
        if (p1Ready && p2Ready) {
            startGame();
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
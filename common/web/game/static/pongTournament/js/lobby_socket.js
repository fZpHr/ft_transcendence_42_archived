// =============================== LOBBY up UX ================================

async function makePlayerLog(userId) {
    try {
        console.log('user join =>', userId);
        let a= 'player-'+ userId
        let userBox = document.getElementById(a);
        let playerStatus = userBox.children[1];
        playerStatus.innerHTML = `
            <div class="waiting-player"></div>
        `;
    } catch (error) {
        console.error('Failed to makePlayerLog', error);
    }
}

async function makePlayerLogout(userId) {
    try {
        console.log('user logout =>', userId);
        let a= 'player-'+ userId
        let userBox = document.getElementById(a);
        let playerStatus = userBox.children[1];
        playerStatus.innerHTML = `
            <div class="pending-player"></div>
        `;
    } catch (error) {
        console.error('Failed to makePlayerLogout', error);
    }
}


// =============================== LOBBY WEBSOCKET ================================

async function connectLobbySocket(roomName) {
    try {
        ws = new WebSocket(`wss://${window.location.host}/ws/lobby/${roomName}/`);
        
        ws.onopen = function () {
            console.log('[WebSocket Lobby] => Connection established to room =>', roomName);
        };
        
        ws.onmessage = async function (e) {
            let data = await JSON.parse(e.data);
            let message = data.message;
            let userId = data.userid;
            if (message === 'join') {
                makePlayerLog(userId);
                sendYourStatusLobby();
            } else if (message === 'up-status') {
                userId = data.senderId;
                makePlayerLog(userId);
                console.log('up-status =>', userId);   
            } else if (message === 'disconnect') {
                userId = data.senderId;
                console.log('up-logout =>', userId);   
                makePlayerLogout(userId);
            } else if (message === 'adding') {
                userId = data.senderId;
                if (userId == -1) {
                    console.log('IA added');
                    innerNewIA();
                } else {
                    let user = await APIgetUserById(userId);
                    innerNewPlayer(user);
                }
            } else {
                console.log('Message received:', e.data);
            }
        };
        
        ws.onclose = function (e) {
            console.log('[WebSocket] => Connection closed:', e);
        };

        ws.onerror = function (error) {
            console.error('[WebSocket] => Error:', error);
        };
    } catch (error) {
        console.error('[WebSocket] => Connection failed', error);
    }
}

function disconnectLobbySocket() {
    try {
        console.log('[WebSocket] => Disconnecting...');
        console.log(userId);
        ws.send(JSON.stringify({
            'message': 'disconnect',
            'senderId': userId
        }));
    } catch (error) {
        console.error('Error in disconnectWebSocket:', error);
    }
}


// =============================== LOBBY msg socket ================================

async function sendNewPlayerLobby(playerId) {
    try {
        let senderId = parseInt(playerId);
        ws.send(JSON.stringify({
            'message': 'adding',
            'senderId': senderId
        }));
    } catch (error) {
        console.error('Error in sendNewPlayerLobby:', error);
    }
}

async function sendNewIaLobby() {
    try {
        ws.send(JSON.stringify({
            'message': 'adding',
            'senderId': -1
        }));
    }
    catch (error) {
        console.error('Error in sendNewIaLobby:', error);
    }
}

async function sendYourStatusLobby() { 
    try {
        let user = await APIgetCurrentUser();
        if (user) {
            let senderId = user.id;
            ws.send(JSON.stringify({
                'message': 'up-status',
                'senderId': senderId
            }));
        } else {
            console.error('No user found');
        }
    } catch (error) {
        console.error('Error in sendYourStatusLobby:', error);
    }
}


async function sendMakeReadyLobby() { 
    try {
        let user = await APIgetCurrentUser();
        if (user) {
            let senderId = user.id;
            ws.send(JSON.stringify({
                'message': 'ready',
                'userid': senderId
            }));
        } else {
            console.error('No user found');
        }
    } catch (error) {
        console.error('Error in sendMakeReadyLobby:', error);
    }
}

async function sendWebSocketLobby(message, contactId) {
    try {
        let user = await APIgetCurrentUser();
        if (user) {
            let senderId = user.id;
            ws.send(JSON.stringify({
                'message': message,
                'senderId': senderId
            }));
        } else {
            console.error('No user found');
        }
    } catch (error) {
        console.error('Error in sendWebSocketLobby:', error);
    }
}

// =============================== LOBBY utils ================================

async function innerNewPlayer(user) {
    try {
        let slopContent = document.getElementById('slop-content');
        let newPlayerDiv = document.createElement('div');
        newPlayerDiv.className = 'player-slot player-present';
        newPlayerDiv.id = `player-${user.id}`;
        newPlayerDiv.innerHTML = `
            <div class="player-data">
                <img src="${user.img.startsWith("profile_pics/") ? "/media/" + user.img : user.img}" alt="pp">
                <div class="player-status-online online"></div>
                <span>${user.username}</span>
            </div>
            <div class="player-status">
                <div class="pending-player"></div>
            </div>
        `;
        slopContent.appendChild(newPlayerDiv);
    } catch (error) {
        console.error('Failed to innerNp', error);
    }
}

async function innerNewIA() {
    try {
        let slopContent = document.getElementById('slop-content');
        let newIaPlayerDiv = document.createElement('div');
        newIaPlayerDiv.className = 'player-slot player-present';
        newIaPlayerDiv.innerHTML = `
            <div class="player-data">
                <img src="https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp" alt="pp">
                <div class="player-status-online online"></div>
                <span>IA</span>
            </div>
            <div class="player-status">
                <div class="waiting-player"></div>
            </div>
        `;
        slopContent.appendChild(newIaPlayerDiv);
    } catch (error) {
        console.error('Failed to innerNewIA', error);
    }
}
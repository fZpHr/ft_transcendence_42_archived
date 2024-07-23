// websocket.js

// ============================== WebSocket PART ==============================

async function updateInviteStatusUI(status) {
    try {
        console.log('status:', status);
        let chatMessages = document.getElementById('chat-messages');
        let gameInvites = chatMessages.getElementsByClassName('game-invite');
        for (let i = 0; i < gameInvites.length; i++) {
            console.log('gameInvites[i]:', gameInvites[i]);
            let gameInvite = gameInvites[i];
            let chooseGamesDiv = gameInvite.getElementsByClassName('choose-games')[0];
            console.log('status:', status);
            status == 2 ? chooseGamesDiv.innerHTML = '<button class="btn btn-join" data-tooltip="Join lobby">Join</button>' : chooseGamesDiv.innerHTML = '<span>Declined</span>';
        }
    } catch (error) {
        console.error('Failed to updateInviteStatusUI:', error);
    }
}


async function sendWebSocketMessage(message, senderId, contactId, wsChat) {
    try {
        let user = await APIgetCurrentUser();
        let myId = user.id;
        if (!message || !senderId || !contactId) {
            console.log('You must provide a message, a senderId and a contactId');
            return;
        }
        if (senderId != myId) {
            console.log('sender id = ', senderId, 'mine = ', myId);
            console.log('You can only send messages from your own account');
            return ;
        }
            
        let data = {
            'message': message,
            'senderId': senderId,
            'contactId': contactId
        };
        wsChat.send(JSON.stringify(data));
    } catch (error) {
        console.error('Error in sendWebSocketMessage:', error);
    }
}

async function addMessageToChat(message, senderId, contactId) {
    try {
        let user = await APIgetCurrentUser();
        let myId = user.id;
        if (!message || !senderId || !contactId) return;
        if (senderId == myId) return ;
        let chatMessages = document.getElementById('chat-messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.classList.add('their-message');
        msgDiv.textContent = message;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error in addMessageToChat:', error);
    }
}

async function addGameInviteToChat(senderId, contactId) {
    try {
        removeGameInvites();
        let chatMessages = document.getElementById('chat-messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.classList.add('their-message');
        msgDiv.classList.add('game-invite');
        let gameDiv = document.createElement('div');
        gameDiv.className = 'game-invite-head';
        gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
        msgDiv.appendChild(gameDiv);
        let chooseGamesDiv = document.createElement('div');
        chooseGamesDiv.className = 'choose-games';
        chooseGamesDiv.innerHTML += '<button class="btn btn-update" data-tooltip="Accept game"><i class="fa-solid fa-check"></i></button><button class="btn btn-update" data-tooltip="Refuse game"><i class="fa-solid fa-xmark"></i></button>';
        msgDiv.appendChild(chooseGamesDiv);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error in addGameInviteToChat:', error);
    }
}

async function connectWebSocket(roomName) {
    try {
        // console.log('Connecting to WebSocket:', roomName);
        wsChat = new WebSocket(`wss://${window.location.host}/ws/chat/${roomName}/`);        

        wsChat.onopen = function () {
            // console.log('[WebSocket] => connection opened');
        };
        
        wsChat.onmessage = function (e) {
            let data = JSON.parse(e.data);
            if (data['senderId'] == userId) return ;
            if (data['message'] == 'Game invite') {
                addGameInviteToChat(data['senderId'], data['contactId']);
                return ;
            } else if (data['message'] == 'Game accepted') {
                updateInviteStatusUI(2);
                return ;
            } else if (data['message'] == 'Game declined') {
                updateInviteStatusUI(-1);
                return ;
            }
            addMessageToChat(data['message'], data['senderId'], data['contactId']);
        };
        
        wsChat.onclose = function (e) {};

        wsChat.onerror = function (error) {
            console.error('[WebSocket] => error:', error);
        };
        return wsChat;
    } catch (error) {
        console.error('[WebSocket] => connection failed', error);
    }
}

async function disconnectWebSocket(wsChat) {
    try {
        wsChat.close();
    } catch (error) {
        console.error('Error in disconnectWebSocket:', error);
    }
}
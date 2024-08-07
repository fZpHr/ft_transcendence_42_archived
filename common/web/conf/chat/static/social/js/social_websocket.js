// websocket.js

// ============================== WebSocket PART ==============================


async function connectSocialWebSocket(roomName) {
    try {
        ws = new WebSocket(`wss://${window.location.host}/ws/social/${roomName}/`);        

        ws.onopen = function () {
        };
        
        ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let updateId = data.updateId;
            let senderId = data.senderId;
            if (senderId !== userId && updateId !== 'undefined' && updateId != -1)
                updateUIStatusUserWS(updateId, senderId);
        };

        ws.onclose = function (e) {};

        ws.onerror = function (error) {
        };
        return ws;
    } catch (error) {
        console.error('[WebSocket] => connection failed', error);
    }
}

async function disconnectSocialWebSocket(ws) {
    try {
        ws.close();
    } catch (error) {
        console.error('Error in disconnectWebSocket:', error);
    }
}
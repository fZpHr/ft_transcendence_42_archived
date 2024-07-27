let users;
let lobbyUUID;
var ws;

document.addEventListener('DOMContentLoaded', async function () {
    lobbyElement = document.getElementById('lobby_uuid');
    lobbyUUID = lobbyElement.getAttribute('data-value');
    lobbyUUID = lobbyUUID.replace(/-/g, '');
    await connectLobbySocket(lobbyUUID);

    window.addEventListener('beforeunload', disconnectLobbySocket);
    window.addEventListener('unload', disconnectLobbySocket);
    ctx = await initCanvas();
    await drawTournament(ctx);
});


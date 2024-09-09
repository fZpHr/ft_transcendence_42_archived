var users;
var lobbyUUID;
var ws;

// document.addEventListener('DOMContentLoaded', async function () {
//     lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value').replace(/-/g, '');
//     let userId = await APIgetCurrentUser();
//     await connectLobbySocket(lobbyUUID);

//     window.addEventListener('beforeunload', disconnectLobbySocket);
//     window.addEventListener('unload', disconnectLobbySocket);
//     // ctx = await initCanvas();
//     // await drawTournament(ctx);
// });

async function domloaded() {
    lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value').replace(/-/g, '');
    let userId = await APIgetCurrentUser();
    await connectLobbySocket(lobbyUUID);

    window.addEventListener('beforeunload', disconnectLobbySocket);
    window.addEventListener('unload', disconnectLobbySocket);
}

domloaded();
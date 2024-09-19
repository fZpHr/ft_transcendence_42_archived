var users;
var lobbyUUID;
var ws;

async function domloaded() {
    lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value').replace(/-/g, '');
    let userId = await APIgetCurrentUser();
    await connectLobbySocket(lobbyUUID);

    innerCanvaIfLockLobby();
}

async function innerCanvaIfLockLobby() {
    try {
        let element = document.getElementById('lobby-body');
        let isLocked = await APIgetLobbyIsLocked(lobbyUUID);
        isLocked = isLocked.locked;
        console.log('isLocked', isLocked);
        if (isLocked) {
            let NbrPlayer = document.getElementsByClassName('player-present').length;
            console.log('NbrPlayer', NbrPlayer);
            tournamentorganized = await APIlockLobby(lobbyUUID);
            tournamentINfo = await APIgetTournamentInfo(tournamentorganized.tournament.UUID);
            await deleteLobbyBody();
            loadCanvaTournament(tournamentINfo, NbrPlayer);
        }
    } catch (error) {
        console.error('Failed to innerCanvaIfLockLobby', error);
    }
}

domloaded();
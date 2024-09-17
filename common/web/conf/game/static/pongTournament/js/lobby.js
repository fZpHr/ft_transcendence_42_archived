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
        let isLocked = element.getAttribute('data-locked');
        if (isLocked) {
            let NbrPlayer = document.getElementsByClassName('player-present').length;
            console.log('NbrPlayer', NbrPlayer);
            tournamentorganized = await APIlockLobby(lobbyUUID);
            tournamentINfo = await APIgetTournamentInfo(tournamentorganized.tournament.UUID);
            deleteLobbyBody();
            loadCanvaTournament(tournamentINfo, NbrPlayer);
        }
    } catch (error) {
        console.error('Failed to innerCanvaIfLockLobby', error);
    }
}

domloaded();
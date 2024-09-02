let users;
let lobbyUUID;
var ws;

document.addEventListener('DOMContentLoaded', async function () {
    console.log("lobby_owner.js loaded");
    lobbyElement = document.getElementById('lobby_uuid');
    lobbyUUID = lobbyElement.getAttribute('data-value');
    users = await APIgetUserAvailableToLobby(lobbyUUID);
    lobbyUUID = lobbyUUID.replace(/-/g, '');
    await connectLobbySocket(lobbyUUID);
    toggleAddingPlayer();
    handlersLockLobby();

    window.addEventListener('beforeunload', disconnectLobbySocket);
    window.addEventListener('unload', disconnectLobbySocket);
});

// =============================== WS LOBBY NOTIF================================


async function connectNotifSocker(userId) {
    try {
        let roomName = await APIgetHashRoom('notif_' + userId);
        roomName = roomName.roomName;
        wsNotif = new WebSocket(`wss://${window.location.host}/ws/notif/${roomName}/`);

        wsNotif.onopen = function () {
            console.log('wssNotif notif connected to ', roomName);
        }

        wsNotif.onerror = function (e) {
            console.error('wssNotif notif error', e);
        }

        wsNotif.onclose = function (e) {
            console.log('wssNotif notif closed');
        }

        wsNotif.onmessage = function (e) {
            console.log('wssNotif notif message received');
            let data = JSON.parse(e.data);
            console.log(data);
        }
        return wsNotif;
    } catch (error) {
        console.error('Failed to connectNotifSocker', error);
    }
}


async function sendWsNotifAtUser(userId) {
    try {
        let wsNotif = await connectNotifSocker(userId);
        let lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value');
        wsNotif.onopen = () => {
            wsNotif.send(JSON.stringify({
                'notifType': 'userNotReady',
                'ID_Game': 'null',
                'userDestination': userId,
                'UUID_Tournament': lobbyUUID,
                'link': '/game/pong/tournament/lobby/?lobby_id='+lobbyUUID,
            }));
            setTimeout(() => {
                wsNotif.close();
            }, 10000);
        };
    } catch (error) {
        console.error('Failed to sendNewPlayerLobby', error);
    }
}

async function sendNotifAtUserNotReady() {
    try {
        let pendingUser = document.getElementsByClassName('pending-player');
        for (let user of pendingUser) {
            let idNumber = user.parentNode.parentNode.id.split("player-")[1];
            sendWsNotifAtUser(idNumber);
            console.log(idNumber);
        }
    } catch (error) {
        console.error('Failed to sendNotifAtUserNotReady', error);
    }
}

// =============================== MENU utils ================================

async function findPlayer(input) {
    try {
        let findUsername = input.toLowerCase();
        let boxFindPlayer = document.getElementById('player-found');
        boxFindPlayer.innerHTML = '';
        console.log(users);
        if (findUsername) {
            const filteredUsers = users.filter(user => user.username.toLowerCase().includes(findUsername));
            filteredUsers.forEach(user => {
                innerPlayerFound(user);
            });
        }
    } catch (error) {
        console.error('Failed to findPlayer', error);
    }

}

async function selectThisPlayer(user) {
    try {
        let userIdToRemove = user.id;
        let box = document.getElementById('search-player');
        parrentBox = box.parentNode;
        parrentBox.removeChild(box);
        parrentBox.remove();
        users = users.filter(user => user.id !== userIdToRemove);
        let msg = 'addPlayer | ' + userIdToRemove;
        await APIaddPlayerToLobby(lobbyUUID, userIdToRemove);
        managerSendToWsLobby('addPlayer', msg, userIdToRemove);
    } catch (error) {
        console.error('Failed to selectThisPlayer', error);
    }
}

async function redirectionManager(tournamentorganized) {
    try {
        console.log('tournamentorganized', tournamentorganized);
    } catch (error) {
        console.error('Failed to redirectionManager', error);
    }
}


// =============================== Lobby display ================================

async function displayChosePlayerMenus() {
    try {
        let newPlayerSlot = document.getElementById('menus-new-player');
        newPlayerSlot.classList.add('active');
    } catch (error) {
        console.error('Failed to displayChosePlayer', error);
    }
}

async function displayNewPlayerForm() {
    try {
        let newPlayerSlot = document.getElementById('newplayer-btn');
        newPlayerSlot.classList.add('active');
    } catch (error) {
        console.error('Failed to displayNewPlayerForm', error);
    }
}


// =============================== Lobby hide ================================

async function hideNewPlayerBtn() {
    try {
        let newPlayerSlot = document.getElementById('newplayer-btn');
        newPlayerSlot.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideNewPlayerBtn', error);
    }
}

async function hideChosePlayerMenus() {
    try {
        let newPlayerSlot = document.getElementById('menus-new-player');
        newPlayerSlot.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideChosePlayer', error);
    }
}

async function deleteLobbyBody() {
    try {
        let lobbyBody = document.getElementById('slop-content');
        lobbyBody.innerHTML = '';
    } catch (error) {
        console.error('Failed to deleteLobbyBody', error);
    }

}

// =============================== Lobby INNER ================================

async function innerNewPlayerChose() {
    try {
        let newPlayerSlot = document.getElementById('new-player-slot');
        let newPlayerDiv = document.createElement('div');
        newPlayerDiv.className = 'player-slot';
        newPlayerDiv.innerHTML = `
            <div class="search-player" id="search-player">
                <div class="tmp-pp">
                    <i class="fas fa-question-circle"></i>
                </div>
                <div class="find-player">
                    <input type="text" placeholder="Enter player name">
                </div>
            </div>
            <div class="player-found" id="player-found">
            </div>
        `;
        newPlayerSlot.parentNode.insertBefore(newPlayerDiv, newPlayerSlot);
        handlersSearchPlayer();
    } catch (error) {
        console.error('Failed to innerNewPlayer', error);
    }
}

async function innerPlayerFound(user) {
    try {
        let boxFindPlayer = document.getElementById('player-found');
        let boxPlayer = document.createElement('div');
        boxPlayer.className = 'player';
        boxPlayer.innerHTML = `
            <div class="img-player" id="user_${user.id}">
                <img src="${user.img.startsWith("profile_pics/") ? "/media/" + user.img : user.img}" alt="pp">
            </div>
            <div class="player-status-online online"></div>
            <div class="username-player">
                <span>${user.username}</span>
            </div>
        `;
        boxFindPlayer.appendChild(boxPlayer);
        boxPlayer.addEventListener('click', () => {
            selectThisPlayer(user);
        });
    } catch (error) {
        console.error('Failed to innerPlayerFound', error);
    }
}

async function innerCanvaTournament() {
    try {
        let element = document.getElementById('lobby-body');
        element.innerHTML = `
            <div id="tournamentConainterOrga" style="display: none;">
            <canvas width="1000" height="600" style="background-color: black;" id="tournamentOrganized"></canvas>
            </div>
        `;
    } catch (error) {
        console.error('Failed to innerCanvaTournament', error);
    }
}

async function displayCanvaTournament() {
    try {
        let tournamentBoxOrga = document.getElementById('tournamentConainterOrga');
        tournamentBoxOrga.style.display = 'block';
    } catch (error) {
        console.error('Failed to displayCanvaTournament', error);
    }
}

// =============================== Lobby handlers ================================

function handlersChosePlayer() {
    try {
        let newPlayerSlot = document.getElementById('new-player-chose');
        let newIASlot = document.getElementById('new-ia-chose');
        newPlayerSlot.addEventListener('click', function () {
            innerNewPlayerChose();
            hideChosePlayerMenus();
            displayNewPlayerForm();
        });

        newIASlot.addEventListener('click', async function () {
            let msg = 'addIa | null';
            managerSendToWsLobby('addIa', msg, null);
            await APIaddIaToLobby(lobbyUUID);
            hideChosePlayerMenus();
            displayNewPlayerForm();
        });
    } catch (error) {
        console.error('Failed to handlersChosePlayer', error);
    }
}

function handlersSearchPlayer() {
    try {
        let searchPlayer = document.querySelector('.search-player input');
        searchPlayer.addEventListener('input', function () {
            let search = searchPlayer.value;
            findPlayer(search);
        });
    } catch (error) {
        console.error('Failed to handlersSearchPlayer', error);
    }
}

function handlersLockLobby() {
    try {
        let lockLobby = document.getElementById('lock-lobby');
        lockLobby.addEventListener('click', async function () {
            let NbrPlayer = document.getElementsByClassName('player-present').length;
            if (NbrPlayer < 4 || (NbrPlayer & (NbrPlayer - 1)) !== 0) {
                console.log('You need to add more players');
                return;
            }            
            let NbrPlayerReady = document.getElementsByClassName('waiting-player').length;
            if (NbrPlayerReady != NbrPlayer) {
                sendNotifAtUserNotReady();
                console.log('You need to wait for all player to be ready');
                return;
            }

            // send lock lobby to ws
            let data = {
                'eventType': 'lock_lobby',
                'UUID': lobbyUUID
            }
            wsLobby.send(JSON.stringify(data));

            // UPDATE view
            deleteLobbyBody();

            let loader = document.getElementById('loader-container');
            loader.style.display = 'block';

            // init canva tournament
            // await innerCanvaTournament();

            // load data and draw tournament
            tournamentorganized = await APIlockLobby(lobbyUUID);
            // ctx = await initCanvas();
            // await drawTournament(ctx, tournamentorganized, NbrPlayer);

            // console.log('tournamentorganized', tournamentorganized.tournament.UUID);
            // tournamentINfo = await APIgetTournamentInfo(tournamentorganized.tournament.UUID);
            loader.style.display = 'none';
            // display canva tournament


            // await displayCanvaTournament();
            // spleep 10s
            // await sleep(10000);
            // redirect to tournament
            // redirectionManager(tournamentINfo);
        });
    } catch (error) {
        console.error('Failed to handlersLockLobby', error);
    }
}


// =============================== Looby toggle ================================

async function toggleAddingPlayer() {
    try {
        handlersChosePlayer();
        const newPlayerSlot = document.getElementById('newplayer-btn');
        newPlayerSlot.addEventListener('click', function () {
            toggleChosePlayer();
        });
    } catch (error) {
        console.error('Failed to toggleAddingPlayer', error);
    }
}

function toggleChosePlayer() {
    try {
        hideNewPlayerBtn();
        displayChosePlayerMenus();
        return;
    } catch (error) {
        console.error('Failed to toggleChosePlayer', error);
    }
}
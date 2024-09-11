function pongTournament() {
    let AllLobby = new Set();

    async function initPongTournament() {
        let newTournamentBtn = document.getElementById('pongTournament-btn');
        let allLobby = await APIgetAllLobby(userId);
        await innerAllLobby(allLobby.data);
        handlersRemoveLobby();
        handlersJoinLobby();
        newTournamentBtn.addEventListener('click', async function () {
            try {
                let newTournament = await APIcreateLobby(userId);
                console.log(newTournament)
                await innerNewLobby(newTournament.lobby);
                handlersJoinLobby();
            } catch (error) {
                console.error('Failed to createGame', error);
            }
        });
    }


    // ========================= INNER newTournament =========================

    async function innerAllLobby(allLobby) {
        try {
            console.log(allLobby);
            let lobbyBox = document.getElementById('all_lobby');
            for (let i = 0; i < allLobby.length; i++) {
                let lobby = allLobby[i];
                let lobbyDiv = document.createElement('div');
                lobbyDiv.classList.add('lobby-element');
                lobbyDiv.innerHTML = `
                    <div id="${lobby.UUID}" class="lobby-element-data">
                        <span>
                            ${lobby.name}
                        </span>
                        <div>
                            <span>
                                ${lobby.nbr_players} <i class="fa-solid fa-user"></i>
                            </span>
                            <span>
                                ${lobby.isLocked ? '🟢' : '🟡'}
                            </span>
                        </div>
                    </div>
                `;
                if (lobby.owner === userId) {
                    lobbyDiv.innerHTML += `
                        <div class="lobby-element-btn">
                            <span id="remove-{${lobby.UUID}}" class="remove-btn" data-lobbyUUID="${lobby.UUID}"><i class="fa-solid fa-xmark"></i></span>
                        </div>
                    `;
                }
                lobbyBox.appendChild(lobbyDiv);
            }
        } catch (error) {
            console.error('Failed to innerAllLobby', error);
        }   
    }

    async function innerNewLobby(newLobby) {
        try {
            console.log(newLobby);
            let lobbyBox = document.getElementById('all_lobby');
            let lobbyDiv = document.createElement('div');
            lobbyDiv.classList.add('lobby-element');
            lobbyDiv.innerHTML = `
                    <div id="${newLobby}" class="lobby-element-data">
                        <span>
                            Tournament
                        </span>
                        <div>
                            <span>
                                1 <i class="fa-solid fa-user"></i>
                            </span>
                            <span>
                                🟡
                            </span>
                        </div>
                    </div>
                    <div class="lobby-element-btn">
                        <span id="remove-{${newLobby}}" class="remove-btn" data-lobbyUUID="${newLobby}"><i class="fa-solid fa-xmark"></i></span>
                    </div>
                `;
            lobbyBox.appendChild(lobbyDiv);
        } catch (error) {
            console.error('Failed to innerNewLobby', error);
        }
    }

    // ========================= handler newTournament =========================

    async function handlersJoinLobby() {
        let allLobby = document.getElementsByClassName('lobby-element-data');
        for (let i = 0; i < allLobby.length; i++) {
            if (AllLobby.has(allLobby[i].id))
                continue;
            allLobby[i].addEventListener('click', async function () {
                console.log(allLobby[i].id);
                let lobbyId = allLobby[i].id;
                console.log(lobbyId);
                htmx.ajax('GET', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`, {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`);
                });
            });
            AllLobby.add(allLobby[i].children[0].id);
        }
    }
    initPongTournament();
}

async function handlersRemoveLobby() {
    try {
        let allRemove = document.getElementsByClassName('remove-btn');
        for (let i = 0; i < allRemove.length; i++) {
            allRemove[i].addEventListener('click', async function () {
                let lobbyUUID = allRemove[i].getAttribute('data-lobbyUUID');
                console.log('remove lobby ' + lobbyUUID);
                let res = await APIremoveLobby(lobbyUUID);
                console.log(res);
                let lobby = document.getElementById(lobbyUUID);
                lobby = lobby.parentElement;
                lobby.remove();
            }
        )};
    } catch (error) {
        console.error('Failed to removeLobby', error);
    }
}

pongTournament();
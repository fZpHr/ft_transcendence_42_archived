function pongTournament() {
    let AllLobby = new Set();

    // document.addEventListener('DOMContentLoaded', async function () {
    async function initPongTournament() {
        let newTournamentBtn = document.getElementById('pongTournament-btn');
        let allLobby = await APIgetAllLobby(userId);
        await innerAllLobby(allLobby.data);
        // for (let i = 0; i < allLobby.length; i++) {
        //     console.log(allLobby[i]);
        // }

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
    // });


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
                    <span id="${lobby}">${lobby.substring(0, 8)}</span>
                `;
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
                <span id="${newLobby}" id="link-${newLobby}">${newLobby.substring(0, 8)}</span>
            `;
            lobbyBox.appendChild(lobbyDiv);
        } catch (error) {
            console.error('Failed to innerNewLobby', error);
        }
    }

    // ========================= handler newTournament =========================

    async function handlersJoinLobby() {
        let allLobby = document.getElementsByClassName('lobby-element');
        for (let i = 0; i < allLobby.length; i++) {
            if (AllLobby.has(allLobby[i].children[0].id))
                continue;
            allLobby[i].addEventListener('click', async function () {
                let lobbyId = allLobby[i].children[0].id;
                console.log(lobbyId);
                window.location.href = `/game/pong/tournament/lobby?lobby_id=${lobbyId}`;
            });
            AllLobby.add(allLobby[i].children[0].id);
        }
    }
    initPongTournament();
}

pongTournament();
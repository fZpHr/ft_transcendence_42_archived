

document.addEventListener('DOMContentLoaded', function() {
    toggleChangeControls();
    toggleCustomGame();
    toggleStartGame();
});


// ================== UPDATE CONTROLS ================== //

async function toggleChangeControls() {
    try {
        let btnsChangeControls = document.querySelectorAll('.btn-change-controls');

        btnsChangeControls.forEach(btn => {
            btn.addEventListener('click', function() {
                addKeydownListener(btn);
            });
        });
    } catch (error) {
        console.error(error);
    }
}

function addKeydownListener(btn) {
    document.addEventListener('keydown', function(event) {
        event.preventDefault();
        let key = event.key;
        key = key.toLocaleUpperCase();
        updateButtonContent(btn, key);
    }, { once: true });
}

function checkIfControllerIsInUse(key) {
    let getKeys = document.querySelectorAll('.btn-change-controls');
    let keys = [];
    getKeys.forEach(btn => {
        keys.push(btn.getAttribute('data-ctrl'));
    });
    if (keys.includes(key)) {
        return true;
    }
    return false;
}

function updateButtonContent(btn, key) {
    if (checkIfControllerIsInUse(key)) {
        console.log('Controller already in use');
        return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
        btn.innerHTML = key;
    } else if (['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'].includes(key)) {
        let arrow;
        switch (key) {
            case 'ARROWUP':
                arrow = '↑';
                break;
            case 'ARROWDOWN':
                arrow = '↓';
                break;
            case 'ARROWLEFT':
                arrow = '←';
                break;
            case 'ARROWRIGHT':
                arrow = '→';
                break;
        }
        btn.innerHTML = arrow;
    }
    btn.setAttribute('data-ctrl', key);
}

// =================== USER INFO =================== //

function getGameUserInfo() {
    try {
        let userInfo = {
            player1: {
                name: document.getElementById('player1_username').value,
                ctrl_up: document.getElementById('player1-ctrl-up').getAttribute('data-ctrl'),
                ctrl_down: document.getElementById('player1-ctrl-down').getAttribute('data-ctrl')
            },
            player2: {
                name: document.getElementById('player2_username').value,
                ctrl_up: document.getElementById('player2-ctrl-up').getAttribute('data-ctrl'),
                ctrl_down: document.getElementById('player2-ctrl-down').getAttribute('data-ctrl')
            }
        };
        return userInfo;
    } catch (error) {
        console.error(error);
    }
}


// ================== TOGGLE MODAL ================== //

async function toggleCustomGame() {
    try {
        let customGame = document.getElementById('curstom-game');

        customGame.addEventListener('click', function() {
            console.log('click custom game');
        });
    } catch (error) {
        console.error(error);
    }
}

async function toggleStartGame() {
    try {
        let startGame = document.getElementById('start-game');

        startGame.addEventListener('click', function() {
            let gameInfo = getGameUserInfo();
            console.log('game user info => ', gameInfo);
            console.log('click start game');
        });
    } catch (error) {
        console.error(error);
    }
}
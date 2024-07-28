import { startGame } from '/static/pong3D/js/pong3D.js';

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
            btn.addEventLtype="module" istener('click', function() {
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
        let key_code = event.keyCode;
        key = key.toLocaleUpperCase();
        updateButtonContent(btn, key, key_code);
    }, { once: true });
}

function checkIfControllerIsInUse(key_code) {
    key_code = key_code.toString();
    let getKeys = document.querySelectorAll('.btn-change-controls');
    let keys = [];
    getKeys.forEach(btn => {
        keys.push(btn.getAttribute('data-ctrl'));
    });
    if (keys.includes(key_code)) {
        return true;
    }
    return false;
}

function updateButtonContent(btn, key, key_code) {
    if (checkIfControllerIsInUse(key_code)) {
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
    btn.setAttribute('data-ctrl', key_code);
}

// =================== USER INFO =================== //

const invisibleChar = '  '; // Non-breaking space
const visibleChar = '  '; // Non-breaking space

function getGameUserInfo() {
    try {

        let name1 = document.getElementById('player1_username').value;
        let name2 = document.getElementById('player2_username').value;

        if (name1.length > name2.length) {
            name2 += visibleChar.repeat(name1.length - name2.length) + '.';
        } else if (name1.length < name2.length) {
            name1 = '.' + visibleChar.repeat(name2.length - name1.length) + name1;
        }

        console.log('name1 => ', name1);
        console.log('name2 => ', name2);

        let awef = name1 + invisibleChar.repeat(14) + name2;
        console.log('debog try =>[', awef, ']size => ', awef.length);

        let userInfo = {
            player1: {
                name: name1,
                ctrl_up: document.getElementById('player1-ctrl-up').getAttribute('data-ctrl'),
                ctrl_down: document.getElementById('player1-ctrl-down').getAttribute('data-ctrl'),
                img: null
            },
            player2: {
                name: name2,
                ctrl_up: document.getElementById('player2-ctrl-up').getAttribute('data-ctrl'),
                ctrl_down: document.getElementById('player2-ctrl-down').getAttribute('data-ctrl'),
                img: null
            },
            nameBord: awef
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
        let startGameBox = document.getElementById('start-game');

        startGameBox.addEventListener('click', function() {
            let gameInfo = getGameUserInfo();
            console.log('game user info => ', gameInfo);
            let player1 = gameInfo.player1;
            let player2 = gameInfo.player2;
            let box = document.getElementById('container-pong3D');
            let footer = document.getElementById('footer');
            footer.style.display = 'none';
            box.innerHTML = '';
            startGame(player1, player2, gameInfo.nameBord);
        });
    } catch (error) {
        console.error(error);
    }
}
import { startGame, movePaddles, moveSphere } from '../../pong3D/js/remote/pong3D.js';
import { Game } from '../../pong3D/js/remote/class/games.js';

let playerReady = false;
let gameStart = false;
let p1Id;
let pIaId;
let game;
let wssGame = null;

async function domLoadedAI() {
	const searchParams = new URLSearchParams(window.location.search);
	let gameId = searchParams.get('id'); // This will be '17' for your example URL
	if (gameId !== null)
		return;
	let inter = setInterval(async () => {
		if (userId !== undefined) {
			p1Id = userId;
			clearInterval(inter);
			toggleCustomGameIA();
			toggleMakeReadyIA();
			await connectWsGameIA();
		}
		console.log("userid :" + userId)
	}, 100)
}

async function setUserToLog() {
	try {
		let secondPlayerBox = document.getElementById('second-player');
		secondPlayerBox.querySelector('.player-box__username').classList.remove('notLog');
		let loaderContainer = document.getElementById('loader-container').style.display = 'none';
		let readyBtn = document.getElementById('ready-game');
		readyBtn.classList.add('active');
	} catch (error) {
		console.error(error);
	}
}

async function setUserToLogout() {
	try {
		let secondPlayerBox = document.getElementById('second-player');
		secondPlayerBox.querySelector('.player-box__username').classList.add('notLog');
		let loaderContainer = document.getElementById('loader-container').style.display = 'flex';
		let readyBtn = document.getElementById('ready-game');
		readyBtn.classList.remove('active');
		p1Ready = false;
		p2Ready = false;
		let boxP2Status = document.getElementById('p2_status');
		boxP2Status.innerHTML = 'Not Ready';
		let boxP1Status = document.getElementById('p1_status');
		boxP1Status.innerHTML = 'Not Ready';
		let btn = document.getElementById('ready-game');
		btn.style.display = 'block';
	} catch (error) {
		console.error(error);
	}
}

async function handleWsGameMessage(data) {
	try {
		console.log("handleWsGameMessage" + JSON.stringify(data, null, 2))
		if (data.userId === userId) {
			return;
		}
		let eventTypes = {
			'ping': ping,
			'pong': pong,
			'move': move, // envoie deplacement {up, down} a laute
			'start': start, // commencer le jeu (pas utiliser ni utils pour le moment)
			'moveBall': moveBall, // deplacement de la balle pas encore fait 
			'end': end
		}; // pas impelementer
		eventTypes[data.eventType](data);
	} catch (error) {
		console.error(error);
	}
}

async function connectWsGameIA() {
	try {
		wssGame = new WebSocket(`wss://${window.location.host}/ws/game/pong/ia/`);

		wssGame.onopen = function (event) {
			let msg = userId + ' | ping';
			sendToWsGame('ping', msg);
		};

		wssGame.onmessage = function (event) {
			let data = JSON.parse(event.data);
			// console.log(data)
			handleWsGameMessage(data);
		};

		wssGame.onclose = function (event) {
			console.log('[WS-g] => is closed now.');
		};

		wssGame.onerror = function (event) {
			console.error('[WS-G] => error observed:', event);
		};

		//  
	} catch (error) {
		console.error(error);
	}
}

// ===============================================================
// ========================= WS Actions =========================
// ===============================================================

// ######### FOR INIT Game #########

async function ping(data) {
	try {
		console.log('[WS-G]=>(' + data.message + ')');

		let msg = userId + ' | pong';
		let pID = parseInt(data.message.split(' | ')[0]);
		if (userId > pID) {
			p1Id = userId;
			pIaId = pID;
		} else {
			p1Id = pID;
			pIaId = userId;
		}
		sendToWsGame('pong', msg);
		setUserToLog();
	} catch (error) {
		console.error(error);
	}
}

async function pong(data) {
	try {
		console.log('[WS-G]=>(' + data.message + ')');
		let pID = parseInt(data.message.split(' | ')[0]);
		if (userId > pID) {
			p1Id = userId;
			pIaId = pID;
		} else {
			p1Id = pID;
			pIaId = userId;
		}


		setUserToLog();
	} catch (error) {
		console.error(error);
	}
}

// ######### FOR Game #########

async function start(data) {
	try {
		console.log('[WS-G]=>(' + data.message + ')');
	} catch (error) {
		console.error(error);
	}
}

async function end(data) {
	try {
		console.log('[WS-G]=>(' + data.message + ')');
	} catch (error) {
		console.error(error);
	}
}

// ######### FOR GAMEPLAY #########

async function move(data) {
	try {
		console.log('[WS-G]=>(' + data.message + ')');
		movePaddles(game, data.message.split(' | ')[0], data.message.split(' | ')[1]);
	} catch (error) {
		console.error(error);
	}
}

async function moveBall(data) {
	try {
		moveSphere(game, parseFloat(data.message));
	} catch (error) {
		console.error(error);
	}
}

// ================== TOGGLE MODAL ================== //

async function toggleCustomGameIA() {
	try {
		let customGame = document.getElementById('curstom-game');

		customGame.addEventListener('click', function () {
			console.log('click custom game');
		});
	} catch (error) {
		console.error(error);
	}
}

async function toggleMakeReadyIA() {
	try {
		let startGameBox = document.getElementById('start-game');

		startGameBox.addEventListener('click', function () {
			playerReady = true;
			let msg = userId + ' | ready';
			sendToWsGame('ready', msg);
            startInstanceAI();
            msg = userId + ' | start';
            sendToWsGame('start', msg);
		});
	} catch (error) {
		console.error(error);
	}
}

// ================== GAME ================== //


async function startInstanceAI() {
	try {
		console.log('toggleGame');

		let box = document.getElementById('container-pong3D');
		let footer = document.getElementById('footer');
		footer.style.display = 'none';
		box.innerHTML = '';
		gameStart = true;
		game = new Game();
		startGame([{ id: userId }, { id: -1 }], game, { userId });
		// toggleMovePlayer(userId);
	} catch (error) {
		console.error(error);
	}
}

async function sendToWsGame(eventType, msg) {
	try {
		let data = {
			"userId": userId,
			"eventType": eventType,
			"message": msg
		};
		wssGame.send(JSON.stringify(data));
	} catch (error) {
		console.error(error);
	}
}

export {
	wssGame,
}

domLoadedAI();
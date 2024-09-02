async function toggleMenuStats() {
	
    // Graph and chart canvas and contexts
    var canvasGraph = document.getElementById('progress-chart');
    var ctxGraph = canvasGraph.getContext('2d');
    var canvasBurger = document.getElementById('progress-burger');
    var ctxBurger = canvasBurger.getContext('2d');

    // Configuration
    var chartConfig = {
        backgroundColor: '#191723',
        gridColor: 'white',
        lineWidth: 1,
        usingWidth: 200,
        usingHeight: 100,
        font: '12px Arial',
        textAlign: 'center',
        pointColor: '#372e47',
    };

    // Fetch user data
	let resp = await fetch('/api/@me/');
	let user = await resp.json();
	let userId = user.id;
	let type = 'connect4';
	let endpoints = {
		numberOfGames: `/getNumberOfGames?user=${userId}&type=${type}`,
		maxWinStreak: `/getMaxWinStreak?user=${userId}&type=${type}`,
		avgGameTime: `/getAvgGameTime?user=${userId}&type=${type}`,
		currentElo: `/getCurrentElo?user=${userId}&type=${type}`,
		maxElo: `/getMaxElo?user=${userId}&type=${type}`,
		getWinrate: `/getWinrate?user=${userId}&type=${type}`,
		lastGameIsWin: `/lastGameIsWin?user=${userId}&type=${type}`,
		lastConnexion: `/lastConnexion?user=${userId}&type=${type}`,
	};


	async function fetchAndUpdate(endpoint, elementId) {
		return new Promise(async(resolve, reject) => {
			let resp = await fetch(`/api${endpoint}`);
			resp = await resp.json()
			document.getElementById(elementId).textContent = resp.value;
			resolve();
		});
	};
	
	async function fetchAndDrawCircle(endpoint) {
		let resp = await fetch(`/api${endpoint}`);
		resp = await resp.json();
		if ('winrate' in resp) {
			drawBurgerChart(ctxBurger, canvasBurger.width, canvasBurger.height, resp.winrate, '#2c2538', '#5d547c');
			drawBurgerChartWinText(ctxBurger, canvasBurger.width, canvasBurger.height, resp.winrate, 'orange', 'lightgray');
		} else {
			console.error("Winrate not found in response");
		}
	};


	async function fetchAndDisplayMatchHistory(userId) {
		try {
			let games = await APIgetConnect4GameForUser(user.id);
			games = games.match_data;
			let statsPanel = document.getElementById('match-history-container');
			statsPanel.innerHTML = '';
			for (const data of games) {
				let game = document.createElement('div');
				game.classList.add('match');
				game.innerHTML = `
					<div class="player-info img-box-match">
						<img src="${data.p1_img}" alt=" ${data.player1_username}" class="img-match ${data.player1_username == data.winner_username ? 'online' : 'offline'}">
						<span class="split-match">/</span>
						<img src="${data.p2_img}" alt=" ${data.player2_username}" class="img-match ${data.player2_username == data.winner_username ? 'online' : 'offline'}">
					</div>
					<div class="match-info time">${ data.time_minutes }m ${ data.time_seconds }s</div>
					<div class="match-winner">${ data.winner_username }</div>
					<div class="match-elo">
						<span style="color: ${data.elo_player1 > 0 ? 'green' : 'red'};">${data.elo_player1}</span>
						<span class="split-match">/</span>
						<span style="color: ${data.elo_player2 > 0 ? 'green' : 'red'};">${data.elo_player2}</span>
					</div>
				`;
				statsPanel.appendChild(game);
			}
		} catch (error) {
			console.error('Error fetching player game data:', error);
		}
	}

	async function addProfileInfo(user) {
		let profileUsername = document.getElementById('profile-username');
		profileUsername.textContent = user.username;
		let imgDiv = document.getElementById('img-profil');
		imgDiv.innerHTML = `
			<a href="/profil/">
				<img src="${user.img}" alt="Profile picture" class="profile-picture">
			</a>
		`;
		const anchors = imgDiv.querySelectorAll('a');
		anchors.forEach(anchor => {
			anchor.addEventListener('click', async (event) => {
				event.preventDefault();
				let href = event.currentTarget.href;
				htmx.ajax('GET', href, {
					target: '#main-content', // The target element to update
					swap: 'innerHTML', // How to swap the content
				}).then(response => {
					history.pushState({}, '', href);
				});
			});
		});
	}

	fetchAndUpdate(endpoints.numberOfGames, 'games-count');
	fetchAndUpdate(endpoints.maxWinStreak, 'max-win-streak');
	fetchAndUpdate(endpoints.avgGameTime, 'avg-game-time');
	fetchAndUpdate(endpoints.currentElo, 'current-elo');
	await fetchAndUpdate(endpoints.maxElo, 'max-elo');
	fetchAndUpdate(endpoints.lastGameIsWin, 'last-game-is-win');
	fetchAndUpdate(endpoints.lastConnexion, 'last-connexion');
	fetchAndDisplayMatchHistory(userId);
	addProfileInfo(user);
	let parent = canvasGraph.parentElement;
	canvasGraph.width = parent.clientWidth;
	canvasGraph.height = parent.clientHeight;
	await drawGraph();

	async function fetchPlayerGameData(userId) {
		try {
			let resp = await fetch(`/api/getPlayerGameData?user=${userId}&type=${type}`);
			let jsonData = await resp.json();
			let gamesData = jsonData.data;
	
			let data = gamesData.map(game => [game.date, game.elo_after]);
			return data;
		} catch (error) {
			console.error('Error fetching player game data:', error);
			return [];
		}
	}

	function getMaxElo() {
		let maxElo = document.getElementById('max-elo').textContent;
		return maxElo * 2;
	}
	
	
	async function drawGraph() {
		let data = await fetchPlayerGameData(user.id);
		
		console.log(data);
		drawChart(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig);
		drawLegendElo(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data.length, getMaxElo());
		drawLegendDate(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data.length, data);
		drawData(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data, getMaxElo());
	
		fetchAndDrawCircle(endpoints.getWinrate);
	}

};

function drawBurgerChart(ctx, width, height, percentage, fillColor, backgroundColor) {

	var radius = Math.min(width, height) / 2;
	var centerX = width / 2;
	var centerY = height / 2;
	var startAngle = 3 * Math.PI / 2;
	var endAngle = startAngle + (percentage / 100) * (2 * Math.PI);

	ctx.fillStyle = backgroundColor;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.arc(centerX, centerY, radius, startAngle, startAngle + 2 * Math.PI);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = fillColor;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.arc(centerX, centerY, radius, startAngle, endAngle);
	ctx.closePath();
	ctx.fill();
}

function drawBurgerChartWinText(ctx, width, height, percentage, fillColor, backgroundColor) {
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.font = '15px Arial';
	ctx.fillText('Win ' + percentage + '%', width * 0.70, height * 0.30);
	ctx.fillText('Lose '+ (100 - percentage) + '%', width * 0.30, height * 0.30);
}

function drawChart(ctxGraph, width, height, config) {
	ctxGraph.fillStyle = config.backgroundColor;
	ctxGraph.fillRect(0, 0, width, height);

	ctxGraph.beginPath();
	ctxGraph.moveTo(30, 0);
	ctxGraph.lineTo(30, height);
	ctxGraph.strokeStyle = config.gridColor;
	ctxGraph.lineWidth = config.lineWidth;
	ctxGraph.stroke();

	ctxGraph.beginPath();
	ctxGraph.moveTo(0, height - 30);
	ctxGraph.lineTo(width, height - 30);
	ctxGraph.strokeStyle = config.gridColor;
	ctxGraph.lineWidth = config.lineWidth;
	ctxGraph.stroke();
}

function drawLegendElo(ctxGraph, width, height, config, numLines, maxElo) {
	ctxGraph.fillStyle = config.gridColor;
	ctxGraph.textAlign = 'center';
	ctxGraph.font = '12px Arial';

	var lineHeight = (height - 30) / numLines;

	for (var i = 0; i < numLines; i++) {
		var elo = Math.round(i * maxElo / (numLines - 1));
		var y = height - 50 - i * lineHeight;
		ctxGraph.fillText(elo, 15, y);
	}
}

function drawLegendDate(ctxGraph, width, height, config, numDates, data) {
	ctxGraph.fillStyle = config.gridColor;
	ctxGraph.textAlign = 'center';
	ctxGraph.font = '10px Arial';

	var lineWidth = (width - 30) / numDates;

	for (var i = 0; i < numDates ; i++) {
		var y = 60 + i * lineWidth;
		ctxGraph.fillText(data[i][0], y, height - 15);
	}
}

function drawData(ctxGraph, width, height, config, data, maxElo) {
	var numPoints = data.length;
	var xStep = (width - 30) / numPoints;
	var lineHeight = (height - 30) / data.length;
	var maxHeight = lineHeight * data.length - 20;
	
	ctxGraph.fillStyle = 'white';
	for (var i = 0; i < numPoints; i++) {
		var x = 60 + i * xStep;
		var y = height - 50 - data[i][1] / maxElo * (height - 50);

		if (i < numPoints - 1) {
			ctxGraph.beginPath();
			ctxGraph.strokeStyle = config.pointColor;
			var xNext = 60 + (i + 1) * xStep;
			var yNext = height - 50 - data[i + 1][1] / maxElo * (height - 50);
			ctxGraph.moveTo(x, y);
			ctxGraph.lineTo(xNext, yNext);
			ctxGraph.stroke();
			ctxGraph.fill();
		}
		ctxGraph.beginPath();
		ctxGraph.arc(x, y, 3, 0, 2 * Math.PI);
		ctxGraph.fill();
		ctxGraph.fill();
	}
}

toggleMenuStats();

let previousWidth = window.innerWidth;
let previousHeight = window.innerHeight;


window.addEventListener('resize', updateSizeOfCanvas);

async function updateSizeOfCanvas() {
    if (window.innerWidth <= 768)
        return;

    if (Math.abs(window.innerWidth - previousWidth) <= 50 && Math.abs(window.innerHeight - previousHeight) <= 50)
        return;

    previousWidth = window.innerWidth;
    previousHeight = window.innerHeight;

    let canvasGraph = document.getElementById('progress-chart');
    let parent = canvasGraph.parentElement;
    canvasGraph.width = parent.clientWidth;
    canvasGraph.height = parent.clientHeight;
    toggleMenuStats();
}

// =================================================================================================

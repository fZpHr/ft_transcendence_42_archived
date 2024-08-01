async function toggleMenu() {
	
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
	let endpoints = {
		numberOfGames: `/getNumberOfGames?user=${userId}`,
		maxWinStreak: `/getMaxWinStreak?user=${userId}`,
		avgGameTime: `/getAvgGameTime?user=${userId}`,
		currentElo: `/getCurrentElo?user=${userId}`,
		maxElo: `/getMaxElo?user=${userId}`,
		tournamentCount: `/getTournamentCount?user=${userId}`,
		getWinrate: `/getWinrate?user=${userId}`,
		lastGameIsWin: `/lastGameIsWin?user=${userId}`,
		lastConnexion: `/lastConnexion?user=${userId}`,
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

			async function fetchPlayerGameData(userId) {
				try {
					let resp = await fetch(`/api/getPlayerGameData?user=${userId}`);
					let jsonData = await resp.json();
					let gamesData = jsonData.data;

					let data = gamesData.map(game => [game.date, game.elo_after]);
					return data;
				} catch (error) {
					console.error('Error fetching player game data:', error);
					return [];
				}
			}
	
			async function findMaxElo(data) {
				let maxElo = 0;
				for (let i = 0; i < data.length; i++) {
					if (data[i][1] > maxElo) {
						maxElo = data[i][1];
					}
				}
				return maxElo + 200;
			}
	
			async function fetchAndDisplayMatchHistory(userId) {
				try {
					let resp = await fetch(`/api/getMatches`);
					let jsonData = await resp.json();
					let matchesData = jsonData.matches;
					let matchHistory = document.getElementById('match-history-container');

					for (let i = 0; i < matchesData.length; i++) {
						let match = matchesData[i];
						let matchDiv = document.createElement('div');
						matchDiv.classList.add('match');
						matchDiv.innerHTML = `
							<div class="player-info">${match.player1.username} / ${match.player2.username}</div>
							<div class="match-info">${match.time}</div>
							<div class="match-winner">${match.winner.username}</div>
							<div class="match-elo">${match.elo_before_player1} / ${match.elo_before_player2}</div>
							<div class="match-elo-after">${match.elo_after_player1} / ${match.elo_after_player2}</div>
						`;
						matchHistory.appendChild(matchDiv);
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
			}
	
            fetchAndUpdate(endpoints.numberOfGames, 'games-count');
            fetchAndUpdate(endpoints.maxWinStreak, 'max-win-streak');
            fetchAndUpdate(endpoints.avgGameTime, 'avg-game-time');
            fetchAndUpdate(endpoints.currentElo, 'current-elo');
            fetchAndUpdate(endpoints.maxElo, 'max-elo');
			fetchAndUpdate(endpoints.tournamentCount, 'tournament-count');
			fetchAndUpdate(endpoints.lastGameIsWin, 'last-game-is-win');
			fetchAndUpdate(endpoints.lastConnexion, 'last-connexion');
			let data = await fetchPlayerGameData(userId);
			
            drawChart(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig);
            drawLegendElo(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data.length, 2000);
            drawLegendDate(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data.length, data);
            drawData(ctxGraph, canvasGraph.width, canvasGraph.height, chartConfig, data, 2000);

			fetchAndDrawCircle(endpoints.getWinrate);
			fetchAndDisplayMatchHistory(userId);
			addProfileInfo(user);
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
		// console.log("elo : ", i , "{",y,"}");
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
	// console.log("H : ", height - 50);
	for (var i = 0; i < numPoints; i++) {
		var x = 60 + i * xStep;
		var y = height - 50 - data[i][1] / maxElo * (height - 50);

		// console.log("point : ", i , "{",y,"}");
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

toggleMenu();
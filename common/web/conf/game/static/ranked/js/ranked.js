let matchMakingSocket = new WebSocket('wss://' + window.location.host + '/ws/game/ranked');

matchMakingSocket.onopen = function(e) {
  console.log('Matchmaking socket connected ' + matchMakingSocket.url);

  let checkUserIdInterval = setInterval(() => {
    if (userId && matchMakingSocket.readyState === WebSocket.OPEN) {
      matchMakingSocket.send(JSON.stringify({ action: 'join', player_id: `${userId}` }));
      clearInterval(checkUserIdInterval); // Stop checking once the message is sent
    }
    updateLoadingText();
  }, 100); // Check every 100 milliseconds
};

matchMakingSocket.onmessage = function(e) {
  console.log("on message trigger")
  const data = JSON.parse(e.data);
  console.log(data)
  switch (data.type) {
    case 'matchFound':
      console.log('Match found with', data.opponent);
      console.log('vs you ', data.player);
      
      let divPlayer = document.getElementById("player-btn");
      let playerAvatar = document.getElementById("playerAvatar");
      let playerName = document.getElementById("playerName");
      let playerElo = document.getElementById("playerElo");
      let playerRatio = document.getElementById("playerRatio");
      
      // ==========================================ADD BY TOTOPH AND BEN ==================================================
      // (pour faire fonctionner les pp 42 et les pp user SANS CHANGER LE CODE DU BACK CAR LE USER MANAGER NE FONCTIONNER PLUS)

      data.opponent.img = data.opponent.img.startsWith("profile_pics") == true ? '/media/' + data.opponent.img : data.opponent.img;
      data.player.img = data.player.img.startsWith("profile_pics") == true ? '/media/' + data.player.img : data.player.img;

      // =================================================================================================================


      playerAvatar.src = data.player.img;
      playerName.textContent = data.player.username;
      playerElo.textContent = data.player.elo;
      // playerRatio.textContent = data.player.ratio;

      let divOpps = document.getElementById("opps-btn");
      let oppsAvatar = document.getElementById("oppsAvatar");
      let oppsName = document.getElementById("oppsName");
      let oppsElo = document.getElementById("oppsElo");
      let oppsRatio = document.getElementById("oppsRatio");


      oppsAvatar.src = data.opponent.img;
      console.log(data.opponent.img, data.player.img);
      oppsName.textContent = data.opponent.username;
      oppsElo.textContent = data.opponent.elo; 
      // oppsRatio.textContent = data.opponent.ratio; 
      let divVs = document.getElementById("vs-text");
      divVs.style.display = "flex"; 
    
      let divWaiting = document.getElementById("waiting-btn");
      divWaiting.style.display = "none";
      divPlayer.style.display = "flex";
      divOpps.style.display = "flex";
      console.log(data.game_id);
      let divTypeGame = document.getElementById("game-type");
      divTypeGame.innerHTML = `<h1>${data.game_type}</h1>`;
      console.log('/game/' + data.game_type + '?id=' + data.game_id)
      setTimeout(() => {
        window.location.href = '/game/' + data.game_type + '?id=' + data.game_id;
      }, 5000);
      break;
    case 'gameStateUpdate':
      console.log('New game state:', data.state);
      break;
    case 'matchmakingStatus':
      console.log('Matchmaking status:', data.status);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
};

function updateLoadingText() {
  const loadingElement = document.getElementById('loadingText');
  let loadingText = loadingElement.textContent;
  let dotCount = (loadingText.match(/\./g) || []).length;

  if (dotCount < 3) {
    loadingElement.textContent = 'Waiting for players' + '.'.repeat(dotCount + 1);
  } else {
    loadingElement.textContent = 'Waiting for players.';
  }
}

setInterval(updateLoadingText, 500);

matchMakingSocket.onclose = function(e) {
  console.error('Matchmaking socket closed unexpectedly');
  setTimeout(connectWebSocket, 1000);
};

matchMakingSocket.onerror = function(error) {
  console.error('WebSocket error:', error);
};

function connectWebSocket() {
  matchMakingSocket = new WebSocket('wss://' + window.location.host + '/ws/game/ranked');
} 


setInterval(() => {
  if (matchMakingSocket.readyState === WebSocket.OPEN) {
    console.log("send message");
    try {
      matchMakingSocket.send(JSON.stringify({ action: 'heartbeat', player_id: `${userId}` }));
    }
    catch (e) {
      console.error("Error while sending heartbeat");
    }
  }
}, 3000);

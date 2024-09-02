import { matchFound } from './matchFound.js';

function createSocket(gameType) {
  let matchMakingSocket = new WebSocket('wss://' + window.location.host + '/ws/game/ranked/' + gameType + '/');
  console.log('Matchmaking socket connected ' + matchMakingSocket.url);

  let checkUserIdInterval = setInterval(() => {
    if (userId && matchMakingSocket.readyState === WebSocket.OPEN) {
      matchMakingSocket.send(JSON.stringify({ action: 'join', player_id: `${userId}`, game_type: gameType }));
      clearInterval(checkUserIdInterval); // Stop checking once the message is sent
    }
    updateLoadingText();
  }, 100); // Check every 100 milliseconds
  matchMakingSocket.onclose = function(e) {
    console.log('Matchmaking socket closed');
    // setTimeout(connectWebSocket, 1000);
  };
  
  let loadingText = setInterval(updateLoadingText, 500);

  matchMakingSocket.onmessage = async function(e) {
    console.log("on message trigger")
    const data = JSON.parse(e.data);
    console.log(data)
    switch (data.type) {
      case 'matchFound':
        matchFound(data);
        break;
      case 'gameStateUpdate':
        console.log('New game state:', data.state);
        break;
      case 'matchmakingStatus':
        console.log('Matchmaking status:', data.status);
        break;
      case 'alreadyInQueue':
        console.log('Already in queue');
        clearInterval(loadingText);
        let divWaiting = document.getElementById("loadingText");
        countdownText(divWaiting.textContent);
        break;
      case 'opponentDisconnected':
        console.log('Opponent disconnected');
        let divOpponentDisconnected = document.getElementById("overlay");
        const timer = document.getElementById("timer");
        const timerText = document.getElementById("timer-text");
        const reconnect = document.getElementById("reconnect");
        const cancel = document.getElementById("cancel");
        [timer, timerText].forEach(el => el.style.display = "none");
        [reconnect, cancel, divOpponentDisconnected].forEach(el => el.style.display = "flex");
        matchMakingSocket.close(1000);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  function countdownText()
  {
    let count = 5;
    let countdown = setInterval(() => {
      if (count === 0) {
        clearInterval(countdown);
        console.log("Redirecting to game page");
        htmx.ajax('GET', '/game/game/', {
          target: '#main-content', // The target element to update
          swap: 'innerHTML', // How to swap the content
        }).then(response => {
          console.log("Redirected to game page", response);
          history.pushState({}, '', '/game/game/');
        })
      }
      else {
        let divWaiting = document.getElementById("loadingText");
        divWaiting.textContent = "Already in queue. Redirecting in " + count + " seconds";
        count--;
      }
    }, 1000);
  }

  matchMakingSocket.onerror = function(error) {
    console.error('WebSocket error:', error);
  };

  let heartbeat = setInterval(() => {
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

  document.getElementById("reconnect").addEventListener("click", function() {
    console.log("reconnect clicked");
    createSocket(gameType);
    const playerDiv = document.getElementById("player-btn");
    const opponentDiv = document.getElementById("opps-btn");
    const gameDiv = document.getElementById("game-type");
    const vsDiv = document.getElementById("vs-text");
    const waitingDiv = document.getElementById("waiting-btn");
    const divOpponentDisconnected = document.getElementById("overlay");
    const divConnect4 = document.getElementById("wrap");
    [playerDiv, opponentDiv, gameDiv, vsDiv, divOpponentDisconnected].forEach(el => el.style.display = "none");
    [divConnect4, waitingDiv].forEach(el => el.style.display = "flex");
  });
  
  document.getElementById("cancel").addEventListener("click", function() {
    console.log("cancel clicked");
    let divWaiting = document.getElementById("game-chooser");
    divWaiting.style.display = "flex";
    let divConnect4 = document.getElementById("wrap");
    divConnect4.style.display = "none";
    let divOpponentDisconnected = document.getElementById("overlay");
    divOpponentDisconnected.style.display = "none";
  });

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
  
  document.addEventListener('htmx:beforeSwap', function(event) {
    /* TODO remove all event listeners here*/
    matchMakingSocket.close();
    console.log("htmx:beforeSwap event listener matchMakingSocket close");
    heartbeat = clearInterval(heartbeat);
    clearInterval(loadingText);
  }, {once: true});
}

document.addEventListener('DOMContentLoaded', function() {
  htmx.ajax('GET', '/game/game/', {
    target: '#main-content', // The target element to update
    swap: 'innerHTML', // How to swap the content
  }).then(response => {
    history.pushState({}, '', '/game/game/');
  });
});

export { createSocket };
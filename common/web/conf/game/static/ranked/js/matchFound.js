function updatePlayerInfo(player, gameType, isOpponent = false)
{
    const prefix = isOpponent ? 'opps' : 'player'
    const imgPath = player.img.startsWith("profile_pics") ? `/media/${player.img}` : player.img;
  
    document.getElementById(`${prefix}Avatar`).src = imgPath;
    document.getElementById(`${prefix}Name`).textContent = player.username;
    if (gameType === "pong")
        document.getElementById(`${prefix}Elo`).textContent = player.eloPong;
    else
        document.getElementById(`${prefix}Elo`).textContent = player.eloConnect4;
    document.getElementById(`${prefix}-btn`).style.display = "flex";
}

function updateGameInfo(data)
{
    updatePlayerInfo(data.player, data.game_type);
    updatePlayerInfo(data.opponent, data.game_type, true);

    document.getElementById("vs-text").style.display = "flex";
    document.getElementById("waiting-btn").style.display = "none";
    document.getElementById("game-type").innerHTML = `<h1>${data.game_type}</h1>`;
  
    startTimer();
    setTimeout(() => {
      const timerText = document.getElementById("timer-text");
      if (timerText.style.display === "flex") {
        window.location.href = `https://` + window.location.host + `/game/${data.game_type}/?id=${data.game_id}`;
      }
    }, 5000);
}

let timerInterval;

function startTimer() {
    const timer = document.getElementById("timer");
    const timerText = document.getElementById("timer-text");
    [timer, timerText].forEach(el => el.style.display = "flex");
    timer.textContent = 5;
    
    // Clear any existing interval to prevent multiple intervals running
    clearInterval(timerInterval);
    
    // Start a new interval and store its ID in the global variable
    timerInterval = setInterval(() => {
        const time = parseInt(timer.textContent);
        if (time > 0) {
            timer.textContent = time - 1;
        } else {
            timer.textContent = "Starting game...";
            clearInterval(timerInterval); // Clear the interval when the timer reaches 0
        }
    }, 1000);
}
  
export function matchFound(data)
{
    updateGameInfo(data);
}
const searchParams = new URLSearchParams(window.location.search);
let gameId = searchParams.get('id'); // This will be '17' for your example URL

let connect4WebSocket = new WebSocket("wss://" + window.location.host + `/ws/game/connect4/${gameId}` + "/");

connect4WebSocket.onopen = function(e) {
    console.log("WebSocket connection established");
    let checkUserIdInterval = setInterval(() => {
        if (userId && connect4WebSocket.readyState === WebSocket.OPEN) {
            connect4WebSocket.send(JSON.stringify({ type: 'join', player_id: `${userId}` }));
          clearInterval(checkUserIdInterval); // Stop checking once the message is sent
        }
      }, 100); // Check every 100 milliseconds
}

connect4WebSocket.onclose = function(e) {
    console.log("WebSocket connection closed");
    setTimeout(() => {
        connect4WebSocket = new WebSocket("wss://" + window.location.host + "/ws/game/connect4/" + gameId + "/");
    }, 1000);
}

var board;


var currentPlayer = null;
var playerTurn = null;
const playerTurnHeader = document.getElementById("player-turn");
const curHeader = document.getElementById("current-player");
let firstMove = true;

function updatePlayerInfo(playerInfo, opponentInfo) {
    document.getElementById('player-info').style.display = "flex";
    document.getElementById('player1-img').src = playerInfo.img;
    document.getElementById('player1-name').innerText = playerInfo.username;
    document.getElementById('player2-img').src = opponentInfo.img;
    document.getElementById('player2-name').innerText = opponentInfo.username;
}

connect4WebSocket.onerror = function(error) {
    console.error("WebSocket error:", error);
}

connect4WebSocket.onmessage = function(e) {
    console.log("After receiving")
    let data = JSON.parse(e.data);
    console.log(data)
    if (data.type == 'error') {
        handleError(data.error_message)
        console.log(data.error_message)
        return
    }
    if (data.type == 'reset') {
        gameFinished(data.winner);
        declareWinner(data.winner);
        return
    }
    if (data.type == 'timer_update')
    {
        let divTimer = document.getElementById("timer");
        divTimer.style.display = "flex";
        divTimer.innerHTML = data.timer;
        return
    }
    if (data.type == 'timeout')
    {
        if (data.winner == currentPlayer)
            console.log("You win due to timeout");
        else
            console.log("You lose due to timeout");
        connect4WebSocket.send(JSON.stringify({ type: "reset", player_id: `${userId}`, winner: data.winner }));
        return
    }
    if (data.type == 'roleGiving') {
        currentPlayer = data.role;
        playerTurn = data.playerTurn;
        curHeader.innerHTML = "Current player: " + currentPlayer;
        playerTurnHeader.innerHTML = "Player turn: " + playerTurn;
        board = data.board;
        const playerInfo = {
            img: data.playerInfo.img.startsWith("profile_pics") ? `/media/${data.playerInfo.img}` : data.playerInfo.img,
            username: data.playerInfo.username + " (" + data.role + ")"
        };
        
        if (data.role == "yellow")
            opponent = "red"
        else
            opponent = "yellow"
        const opponentInfo = {
            img: data.opponentInfo.img.startsWith("profile_pics") ? `/media/${data.opponentInfo.img}` : data.opponentInfo.img,
            username: data.opponentInfo.username + " (" + opponent + ")"
        };

        updatePlayerInfo(playerInfo, opponentInfo);
        firstMove = false;
        // check if the board is empty
        for (var row = 0; row < 6; row++) {
            for (var col = 0; col < 7; col++) {
                if (board[row][col] == 'red') {
                    document.getElementById(row + " " + col).classList.add("red");
                } else if (board[row][col] == 'yellow') {
                    document.getElementById(row + " " + col).classList.add("yellow");
                }
            }
        }
        return
    }
    board = data.board;
    let playerPlayed = data.player;
    let tile = document.getElementById(data.row + " " + data.column);
    tile.classList.add(playerPlayed);
    playerTurn = data.next_player;
    playerTurnHeader.innerHTML = "Player turn: " + playerTurn;

    if (checkWin(data.row, data.column)) {
        connect4WebSocket.send(JSON.stringify({ type:"reset", player_id: `${userId}`, winner: playerPlayed}));
        return;
    }
    playerMove(data.column, playerTurn);
}

const turnTimeLimit = 30000;

function playerMove() {
    checkPlayer = playerTurn == "red" ? "yellow" : "red";
    // startTurnTimer(checkPlayer);
}

function declareWinner(winner) {
    console.log(`${winner} wins due to timeout!`);
}

playerMove();

function gameFinished(winner) {
    document.getElementById('timer').innerText = '';
    localStorage.removeItem('remainingTime');
    localStorage.removeItem('currentPlayer');
    console.log(`${winner} wins!`);
    let divOpponentDisconnected = document.getElementById("overlay");
    document.getElementById("timer").style.display = "none";
    // const timerText = document.getElementById("timer-text");
    const reconnect = document.getElementById("reconnect");
    const cancel = document.getElementById("cancel");
    const winnerText = document.getElementById("winnerText");
    if (winner == currentPlayer)
    {
        winnerText.innerHTML = "You win!";
        winnerText.style.color = "green";
    }
    else
    {
        winnerText.innerHTML = "You lose";
        winnerText.style.color = "red";
    }
    [reconnect, cancel, divOpponentDisconnected, winnerText].forEach(el => el.style.display = "flex");
}

function checkWin(row, col) {
    var count = 0;
    var i;


    for (i = 0; i < 7; i++) {
        if (board[row][i] == currentPlayer) {
            count++;
            if (count == 4) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // Check column
    count = 0;
    for (i = 0; i < 6; i++) {
        console.log("row", i, col)
        console.log("currentPlayer", currentPlayer)
        console.log("board", board[i][col])
        if (board[i][col] == currentPlayer) {
            count++;
            if (count == 4) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // Check diagonal (top-left to bottom-right)
    count = 0;
    for (i = -3; i <= 3; i++) {
        if (row + i >= 0 && row + i < 6 && col + i >= 0 && col + i < 7) {
            if (board[row + i][col + i] == currentPlayer) {
                count++;
                if (count == 4) {
                    return true;
                }
            } else {
                count = 0;
            }
        }
    }

    // Check diagonal (bottom-left to top-right)
    count = 0;
    for (i = -3; i <= 3; i++) {
        if (row + i >= 0 && row + i < 6 && col - i >= 0 && col - i < 7) {
            if (board[row + i][col - i] == currentPlayer) {
                count++;
                if (count == 4) {
                    return true;
                }
            } else {
                count = 0;
            }
        }
    }

    return false;
}
function checkAvailableTile(row, col)
{
    if (board[row][col] != '')
        return false;
    if (row != 5 && board[row + 1][col] != '')
        return true;
    if (row == 5 && board[row][col] == '')
        return true;
    return false;
}

function setGame() 
{
    for (var row = 0; row < 6; row++)
    {
        for (var col = 0; col < 7; col++) 
        {
            let tile = document.createElement("div");
            tile.className = "tile";
            tile.id = row + " " + col
            tile.addEventListener("click", function() {
                let [tileRow, tileCol] = tile.id.split(" ").map(Number)
                if (!checkAvailableTile(tileRow, tileCol))
                {
                    console.log("wronggg");
                    return
                }
                if (!tile.classList.contains("red") && !tile.classList.contains("yellow") && currentPlayer == playerTurn)
                {
                    connect4WebSocket.send(JSON.stringify({ 
                        type:"game.move",
                        player: currentPlayer,
                        row: tileRow, col: tileCol,
                        player_id: `${userId}`
                    }));
                }
            })
            document.getElementById("connect-four").appendChild(tile);
        }
    }
}

function handleError(message)
{
    let msgError = document.createElement("div")
    msgError.innerHTML = message
}

document.addEventListener('htmx:beforeSwap', function(event) {
    connect4WebSocket.close();
    console.log("htmx:beforeSwap event listener matchMakingSocket close");
});

setGame();
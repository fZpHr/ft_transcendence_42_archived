const searchParams = new URLSearchParams(window.location.search);
let gameId = searchParams.get('id'); // This will be '17' for your example URL

let connect4WebSocket = new WebSocket(`wss://${window.location.host}/ws/game/connect4/${gameId}/`);        

connect4WebSocket.onopen = function(e) {
    console.log("WebSocket connection established");
    connect4WebSocket.send(JSON.stringify({ type: 'join' }));
}

connect4WebSocket.onclose = function(e) {
    console.error("WebSocket connection closed unexpectedly");
    setTimeout(() => {
        connect4WebSocket = new WebSocket("wss://" + window.location.host + "/ws/game/connect4/" + gameId + "/");
    }, 1000);
}

var board = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null]
];


var currentPlayer = null;
var playerTurn = null;
const playerTurnHeader = document.getElementById("player-turn");
const curHeader = document.getElementById("current-player");

connect4WebSocket.onerror = function(error) {
    console.error("WebSocket error:", error);
}

connect4WebSocket.onmessage = function(e) {
    console.log("After receiving")
    let data = JSON.parse(e.data);
    console.log(data)
    if (data.type == 'error')
    {
        handleError(data.error_message)
        console.log(data.error_message)
        return
    }
    if (data.type == 'reset')
    {
        resetGame()
        return
    }
    if (data.type == 'roleGiving')
    {
        currentPlayer = data.role;
        playerTurn = data.playerTurn;
        curHeader.innerHTML = "Current player: " + currentPlayer;
        playerTurnHeader.innerHTML = "Player turn: " + playerTurn;
        return
    }
    console.log(data);
    let playerPlayed = data.player;
    board[data.row][data.column] = playerPlayed
    let tile = document.getElementById(data.row + " " + data.column);
    tile.classList.add(playerPlayed);
    playerTurn = data.next_player;
    playerTurnHeader.innerHTML = "Player turn: " + playerTurn;
    if (checkWin(data.row, data.col)) {
        connect4WebSocket.send(JSON.stringify({ type:"reset" }))
        resetGame();
        return;
    }
}



function resetGame() {
    for (var row = 0; row < 6; row++) {
        for (var col = 0; col < 7; col++) {
            board[row][col] = null;
            document.getElementById(row + " " + col).classList.remove("red");
            document.getElementById(row + " " + col).classList.remove("yellow");
        }
    }
}

function checkWin(row, col) {
    var count = 0;
    var i;

    // Check row
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
        if (board[i][col] == currentPlayer) {
            count++;
            if (count == 4) {
                return true;
            }
        } else {
            count = 0;
        }
    }

    // Check diagonal
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

    // Check anti-diagonal
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
    if (board[row][col] != null)
        return false;
    if (row != 5 && board[row + 1][col] != null)
        return true;
    if (row == 5 && board[row][col] == null)
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
setGame();
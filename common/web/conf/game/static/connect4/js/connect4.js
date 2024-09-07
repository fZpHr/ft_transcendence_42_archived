import { createSocket } from "../../ranked/js/socket.js";

var connect4WebSocket;

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function connect4Load()
{
    const searchParams = new URLSearchParams(window.location.search);
    let gameId = searchParams.get('id'); // This will be '17' for your example URL

    connect4WebSocket = new WebSocket("wss://" + window.location.host + `/ws/game/connect4/${gameId}` + "/");

    connect4WebSocket.onopen = function(e) {
        console.log("WebSocket connection established connect4");
        let checkUserIdInterval = setInterval(() => {
            if (userId && connect4WebSocket.readyState === WebSocket.OPEN) {
                connect4WebSocket.send(JSON.stringify({ type: 'join', player_id: `${userId}` }));
                clearInterval(checkUserIdInterval); // Stop checking once the message is sent
            }
        }, 100); // Check every 100 milliseconds
    }

    connect4WebSocket.onclose = function(e) {
        console.log("WebSocket connection closed");
    }

    connect4WebSocket.onerror = function(error) {
        console.error("WebSocket error:", error);
    }
    
    connect4WebSocket.onmessage = async function(e) {
        console.log("After receiving")
        let data = JSON.parse(e.data);
        console.log(data)
        switch (data.type) {
            case 'error':
                handleError(data.error_message);
                console.log(data.error_message);
                break;
            case 'roomFull':
                console.log("Room is full");
                await sleep(3000);
                htmx.ajax('GET', '/game/game/', {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', '/game/game/');
                });
                break;
            case 'reset':
                gameFinished(data.winner);
                break;
            case 'timer_update':
                let divTimer = document.getElementById("timer");
                divTimer.style.display = "flex";
                divTimer.innerHTML = data.timer;
                playerTurn = data.playerTurn;
                playerTurnHeader.innerHTML = "Player turn: " + playerTurn;
                let user, opp;
                if (data.player1.id == userId)
                {
                    user = data.player1;
                    opp = data.player2;
                }
                else
                {
                    user = data.player2;
                    opp = data.player1;
                }
                curHeader.innerHTML = "Current player: " + user.color;
                const playerInfo = {
                    img: user.img.startsWith("profile_pics") ? `/media/${user.img}` : user.img,
                    username: user.username + " (" + user.color + ")"
                };
                try {
                    const opponentInfo = {
                        img: opp.img.startsWith("profile_pics") ? `/media/${opp.img}` : opp.img,
                        username: opp.username + " (" + opp.color + ")"
                    };
                    updatePlayerInfo(playerInfo, opponentInfo);
                } catch (e) {
                    updatePlayerInfo(playerInfo, { img: "/media/profile_pics/default.png", username: "Waiting for opponent" });
                }
                updateBoard(data);
                break;
            case 'timeout':
                if (data.winner == currentPlayer)
                    console.log("You win due to timeout");
                else
                    console.log("You lose due to timeout");
                connect4WebSocket.send(JSON.stringify({ type: "reset", player_id: `${userId}`, winner: data.winner }));
                break;
            case 'roleGiving':
                roleGiving(data);
                break;
            default:
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
        }
    }
}

function roleGiving(data)
{
    currentPlayer = data.role;
    curHeader.innerHTML = "Current player: " + currentPlayer;
    playerTurn = data.playerTurn;
    playerTurnHeader.innerHTML = "Player turn: " + playerTurn;
    const playerInfo = {
        img: data.playerInfo.img.startsWith("profile_pics") ? `/media/${data.playerInfo.img}` : data.playerInfo.img,
        username: data.playerInfo.username + " (" + data.role + ")"
    };
    let opponent;
    if (data.role == "yellow")
        opponent = "red"
    else
        opponent = "yellow"
    try {
        const opponentInfo = {
            img: data.opponentInfo.img.startsWith("profile_pics") ? `/media/${data.opponentInfo.img}` : data.opponentInfo.img,
            username: data.opponentInfo.username + " (" + opponent + ")"
        };
        updatePlayerInfo(playerInfo, opponentInfo);
    } catch (e) {
        updatePlayerInfo(playerInfo, { img: "/media/profile_pics/default.png", username: "Waiting for opponent" });
    }
    firstMove = false;
    // check if the board is empty
    updateBoard(data);
}

function updateBoard(data) {
    board = data.board;
    for (var row = 0; row < 6; row++) {
        for (var col = 0; col < 7; col++) {
            if (board[row][col] == 'red') {
                document.getElementById(row + " " + col).classList.add("red");
            } else if (board[row][col] == 'yellow') {
                document.getElementById(row + " " + col).classList.add("yellow");
            }
        }
    }
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

async function gameFinished(winner) {
    await sleep(1000);
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
    if (winner == "draw")
    {
        winnerText.innerHTML = "Draw!";
        winnerText.style.color = "white";
    }
    [reconnect, cancel, divOpponentDisconnected, winnerText].forEach(el => el.style.display = "flex");
    cancel.addEventListener("click", () => {
        htmx.ajax('GET', '/game/game/', {
            target: '#main-content', // The target element to update
            swap: 'innerHTML', // How to swap the content
        });
        htmx.on('htmx:afterSwap', (event) => {
            if (event.detail.target.id === 'main-content') {
                history.pushState({}, '', '/game/game/');
            }
        });
    });
    reconnect.addEventListener("click", () => {
        htmx.ajax('GET', '/game/ranked/', {
            target: '#main-content', // The target element to update
            swap: 'innerHTML', // How to swap the content
        });
        htmx.on('htmx:afterSwap', (event) => {
            if (event.detail.target.id === 'main-content') {
                history.pushState({}, '', '/game/ranked/');
                let intervalId = setInterval(() => {
                    let divConnect4 = document.getElementById("wrap");
                    if (divConnect4) {
                        clearInterval(intervalId);
                        createSocket("connect4");
                        const playerDiv = document.getElementById("player-btn");
                        const opponentDiv = document.getElementById("opps-btn");
                        const gameDiv = document.getElementById("game-type");
                        const vsDiv = document.getElementById("vs-text");
                        const waitingDiv = document.getElementById("waiting-btn");
                        [playerDiv, opponentDiv, gameDiv, vsDiv].forEach(el => el.style.display = "none");
                        [divConnect4, waitingDiv].forEach(el => el.style.display = "flex");
                    }
                }, 100);
            }
        });
    })
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

connect4Load();
setGame();
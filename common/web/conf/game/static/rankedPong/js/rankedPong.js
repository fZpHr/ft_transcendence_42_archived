import { createSocket } from "../../ranked/js/socket.js";

async function connectToRankedPong()
{
    let intervalId = setInterval(() => {
        let divConnect4 = document.getElementById("wrap");
        if (divConnect4) {
            clearInterval(intervalId);
            createSocket("pong");
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

connectToRankedPong();
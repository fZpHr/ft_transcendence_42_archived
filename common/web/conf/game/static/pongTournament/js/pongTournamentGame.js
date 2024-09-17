async function handelWinBtn() {
    try {
        let winBtn = document.getElementById('btnSetWinner');
        console.log(winBtn);
        winBtn.addEventListener('click', async function () {
            let gameId = document.getElementById('warp-pongT').getAttribute('data-id');
            let users = document.getElementsByClassName('user');
            // chose and user randomly
            let winner = users[Math.floor(Math.random() * users.length)];
            let winnerId = winner.getAttribute('data-id');
            let winnerIsIa = winner.getAttribute('data-ia') === 'ia' ? true : false;
            console.log('gameId = ', gameId);
            
            console.log('winner = ', winnerId);
            console.log('winnerIsIa = ', winnerIsIa);

            // let resp = await APIsetWinnerAtTournamentGame(gameId, winnerId, winnerIsIa);
            let resp = await APIsetWinnerAtTournamentGame(gameId, userId, false);
            console.log(resp);
        });
    } catch (error) {
        console.error(error);
    }
}


handelWinBtn();

document.addEventListener('DOMContentLoaded', async function () {

    try {
        let pongTournamentBtn = document.getElementById('pong-tournament-btn');
        let pongRankedBtn = document.getElementById('pong-ranked-btn');
        let pongIABtn = document.getElementById('pong-ia-btn');
        let pongMandaBtn = document.getElementById('pong-manda-btn');
        let pongCustomBtn = document.getElementById('pong-custom-btn');        let connect4RankedBtn = document.getElementById('connect4-ranked-btn');
        let connect4IABtn = document.getElementById('connect4-ia-btn');

        let btns = [pongTournamentBtn, pongRankedBtn, pongIABtn, pongMandaBtn, pongCustomBtn,connect4RankedBtn, connect4IABtn];
        let links = [
            '/game/lobby/',
            '/game/ranked/',
            '/game/pong3D/',
            '/game/pongManda/',
            '/game/pongCustom/',
            '/game/ranked/',
            '/game/connect4/ia/'
        ];

        for (let i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                window.location.href = links[i];
            });
        }
    } catch (error) {
        console.error(error);
    }
});
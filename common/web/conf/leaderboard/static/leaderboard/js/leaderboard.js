async function loadLeaderboard()
{
    try {
		let statsOptions = document.querySelectorAll('.select-game-history-option');
		statsOptions.forEach(option => {
			option.addEventListener('click', function () {
				statsOptions.forEach(option => {
					option.classList.remove('active');
				});
				option.classList.add('active');
				let type = option.getAttribute('data-type');
				loadStats(type);
			});
		});
	} catch (e) {
		console.error(e);
	}
}

async function loadStats(type)
{
    let pongPodium = document.getElementById('pong-podium');
    let pongLeaderboard = document.getElementById('pong-leaderboard');
    let connectPodium = document.getElementById('connect4-podium');
    let connectLeaderboard = document.getElementById('connect4-leaderboard');
    if (type === 'pong')
    {
        pongPodium.style.display = 'flex';
        pongLeaderboard.style.display = 'flex';
        connectPodium.style.display = 'none';
        connectLeaderboard.style.display = 'none';
    }
    else
    {
        pongPodium.style.display = 'none';
        pongLeaderboard.style.display = 'none';
        connectPodium.style.display = 'flex';
        connectLeaderboard.style.display = 'flex';
    }
}

loadLeaderboard();
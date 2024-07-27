document.addEventListener('DOMContentLoaded', async function() {
    const inputs = document.querySelectorAll('.warp-input input');
    innerCurrentPlayer();

    toggleSubmitForm();
    toogleFiledInputs(inputs);
    toggleShowPasswords();
});

async function innerCurrentPlayer() {
    try {
        let player = await APIgetCurrentUser();
        console.log(player.img);
        let playerBox = document.getElementById('leftPlayer');
        let playerImg = document.getElementById('leftPlayer-img');
        let playerName = document.getElementById('leftPlayer-name');
        let playerElo = document.getElementById('leftPlayer-elo');
        playerName.innerText = player.username;
        playerElo.innerText = player.elo;
        playerImg.src = player.img.startsWith('profile_pics/') ? '/media/' + player.img : player.img;
        console.log(playerImg.src);
    } catch (e) {
        console.log(e);
    }
}

async function innerSecondPlayer(player) {
    try {
        let playerBox = document.getElementById('rightPlayer');
        let playerImg = document.getElementById('rightPlayer-img');
        playerImg.src = player.img.startsWith('profile_pics/') ? '/media/' + player.img : player.img;
        let chosePlayerForm = document.getElementById('chose-player-form');
        chosePlayerForm.remove();
        let bodyRight = document.getElementById('body-right');
        console.log(bodyRight);
        bodyRight.innerHTML = `
            <h2 id="leftPlayer-name">${player.username}</h2>
            <p>Elo: <span id="leftPlayer-elo">${player.elo}</span></p>
        `;
    } catch (e) {
        console.log(e);
    }
}

// ============================ FORM utils ============================

async function toogleFiledInputs(inputs) {
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            checkIfInputIsFiled(input);
            if (input.type === 'email') {
                checkEmail(input);
            } else if (input.type === 'password') {
                checkPassword(input);
            }
        });
    });
}

async function toggleShowPasswords() {
    let events = [];

    events.push({ event: document.getElementById('togglePasswordLogin'), button: document.getElementById('login-pass') }, { event: document.getElementById('togglePasswordRegister'), button: document.getElementById('register-pass') });
    for (let i = 0; i != events.length; i++) {
        if (events[i].event && events[i].button) {
            events[i].event.addEventListener('click', function () {
                const type = events[i].button.getAttribute('type') === 'password' ? 'text' : 'password';
                events[i].button.setAttribute('type', type);
                events[i].event.innerHTML = type == 'password' ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            });
        }
    }
}

async function APIlogUserForPlay(formData) {
    try {
        const response = await fetch('/api/logUserForPlay/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to login:', error);
        throw error;
    }
}

async function toggleSubmitForm() {
    try {
        let events = [
            {
                btn: document.getElementById('login-submit'),
                form: document.getElementById('chose-player-form'),
                action: APIlogUserForPlay,
                errorBox: document.getElementById('error-login-value')
            }
        ];

        events.forEach(event => {
            if (event.btn) {
                event.btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const form = event.form;
                    const data = new FormData(form);
                    try {
                        const result = await event.action(data);
                        const errorElement = form.querySelector('.error-messages');
                        if (errorElement) {
                            errorElement.innerHTML = '';
                            errorElement.style.display = 'none';
                        }
                        if (result.success) {
                            console.log(result);
                            innerSecondPlayer(result);
                        } else {
                            event.errorBox.innerHTML = result.error;
                            event.errorBox.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Request failed:', error);
                        event.errorBox.innerHTML = 'An unexpected error occurred. Please try again.';
                        event.errorBox.style.display = 'block';
                    }
                    console.log('test');
                });
            }
        });
    } catch (error) {
        console.error('Failed to submit form:', error);
        throw error;
    }
}

// ===================== Checker INPUT ========================

// for email

async function checkIfInputIsFiled(input) {
    let label = input.nextElementSibling;
    let validIndicator = input.parentElement.querySelector('.valid-indicator');
    console.log(input.value);
    if (input.value) {
        label.classList.add('filled');
        validIndicator.style.opacity = '1';
    } else {
        label.classList.remove('filled');
        validIndicator.style.opacity = '0';
    }
}

async function checkEmail(input) {
    let validIndicator = input.parentElement.querySelector('.valid-indicator');
    if (validateEmail(input.value)) {
        validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
        validIndicator.classList.remove('invalid');
        validIndicator.classList.add('valid');
    } else {
        validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
        validIndicator.classList.remove('valid');
        validIndicator.classList.add('invalid');
    }
};

// for password

async function checkPassword(input) {
    let validIndicator = input.parentElement.querySelector('.valid-indicator');
    if (validatePassword(input.value)) {
        validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
        validIndicator.classList.remove('invalid');
        validIndicator.classList.add('valid');
    } else {
        validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
        validIndicator.classList.remove('valid');
        validIndicator.classList.add('invalid');
    }
}

// ===================== Checker utils ========================

function validateEmail(email) {
    const re = /^(?![.-])(?!.*[_.-]{2})[a-zA-Z0-9._-]+(?<![.-])@(?![.-])(?!.*[.-]{2})[a-zA-Z0-9.-]+(?<![.-])\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

function validatePassword(password) {
    if (password.length < 8) {
        return false;
    }
    const hasDigit = /[0-9]/.test(password);
    if (!hasDigit) {
        return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
        return false;
    }
    return true;
}

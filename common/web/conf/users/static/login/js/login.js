function toggleJS() {
	const inputs = document.querySelectorAll('.warp-input input');
	toggleChangeForm();
	toggleSubmitForm();
	toogleFiledInputs(inputs);
	toggle42Login();
	toggleShowPasswords();
}


// ===================== Toogle ========================

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}


async function APIlogin(formData) {
	try {
		const response = await fetch('/api/login_player/', {
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

async function APIregister(formData) {
	try {
		const response = await fetch('/api/register_player/', {
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
		console.error('Failed to register:', error);
		throw error;
	}
}


async function toggleSubmitForm() {
	try {
		let events = [
			{
				btn: document.getElementById('login-submit'),
				form: document.getElementById('login-form'),
				action: APIlogin,
				errorBox: document.getElementById('error-login-value')
			},
			{
				btn: document.getElementById('register-submit'),
				form: document.getElementById('register-form'),
				action: APIregister,
				errorBox: document.getElementById('error-register-value')
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
                            userIsAuthenticated = true;
                            htmx.ajax('GET', result.redirect_url || '/', {
                                target: '#main-content',
                                swap: 'innerHTML',
                            }, {once: true}).then(response => {
                                history.pushState({}, '', result.redirect_url || '/');
                            });
                        } else {
                            event.errorBox.innerHTML = 'Invalid credentials. Please try again.';
                            event.errorBox.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Request failed:', error);
                        event.errorBox.innerHTML = 'An unexpected error occurred. Please try again.';
                        event.errorBox.style.display = 'block';
                    }
                });
            }
        });
    } catch (error) {
        console.error('Failed to submit form:', error);
        throw error;
    }
}



async function toggleChangeForm() {
	let events = [
		{
			btn: document.getElementById('login-btn'),
			forms: {
				show: document.getElementById('login-form'),
				hide: document.getElementById('register-form')
			},
			classAction: {
				add: 'login-btn',
				remove: 'register-btn'
			}
		},
		{
			btn: document.getElementById('register-btn'),
			forms: {
				show: document.getElementById('register-form'),
				hide: document.getElementById('login-form')
			},
			classAction: {
				add: 'register-btn',
				remove: 'login-btn'
			}
		}
	];

	events.forEach(event => {
		if (event.btn) {
			event.btn.addEventListener('click', () => {
				event.forms.show.style.display = 'block';
				event.forms.hide.style.display = 'none';

				document.getElementById(event.classAction.add).classList.add('active');
				document.getElementById(event.classAction.remove).classList.remove('active');
			});
		}
	});
}

async function toggle42Login() {
    const btn42 = document.getElementById('btn-42');
    if (!btn42) {
        return;
    }
    
    btn42.addEventListener('click', () => {
        const hostname = window.location.hostname;
        const redirectUri = `https://${hostname}:42424/api/register-42/`;
        const clientId = 'u-s4t2ud-74438314e8cff2be68aee7a119f4c95bff6ba35b11a2bf5c2627a31a869c9f28';
        const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
        window.location.href = authUrl;
    });
}

async function toogleFiledInputs(inputs) {
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            checkIfInputIsFiled(input);
            if (input.type === 'email') {
                checkEmail(input);
            } else if (input.id === 'login-pass' || input.id === 'register-pass') {
                console.log('password');
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
                console.log(events[i]);
                const type = events[i].button.getAttribute('type') === 'password' ? 'text' : 'password';
                events[i].button.setAttribute('type', type);
                events[i].event.innerHTML = type == 'password' ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            });
        }
    }
}


// ===================== Checker INPUT ========================

// for email

async function checkIfInputIsFiled(input) {
	let label = input.nextElementSibling;
	let validIndicator = input.parentElement.querySelector('.valid-indicator');
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
    console.log('checkPassword');
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

toggleJS();
document.addEventListener('DOMContentLoaded', function () {
	const inputs = document.querySelectorAll('.warp-input input');

	inputs.forEach(input => {
		const warpInput = input.parentElement;
		const validIndicator = warpInput.querySelector('.valid-indicator');

		const checkInputRegister = () => {
			const label = input.nextElementSibling;
			if (input.value !== '') {
				label.classList.add('filled');
				validIndicator.style.opacity = '1';
			} else {
				label.classList.remove('filled');
				validIndicator.style.opacity = '0';
			}
			checkIndicatorsRegister();
		};

		const checkEmailRegister = () => {
			const emailIndicator = document.getElementById('email-indicator-register');
			if (validateEmailRegister(input.value)) {
				emailIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
				emailIndicator.classList.remove('invalid');
				emailIndicator.classList.add('valid');
			} else {
				emailIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
				emailIndicator.classList.remove('valid');
				emailIndicator.classList.add('invalid');
			}
		};

		const checkPasswordStrength = () => {
			const passwordIndicator = document.getElementById('password-indicator-register');
			if (validatePasswordStrength(input.value)) {
				passwordIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
				passwordIndicator.classList.remove('invalid');
				passwordIndicator.classList.add('valid');
			} else {
				passwordIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
				passwordIndicator.classList.remove('valid');
				passwordIndicator.classList.add('invalid');
			}
		};

		input.addEventListener('input', () => {
			checkInputRegister();

			if (input.type === 'email') {
				checkEmailRegister();
			} else if (input.id === 'login-pass' || input.id === 'register-pass') {
				checkPasswordStrength();
			}
		});

		input.addEventListener('focusout', checkInputRegister);
	});

	function validateEmailRegister(email) {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	function validatePasswordStrength(password) {
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

	function checkIndicatorsRegister() {
		const emailIndicator = document.getElementById('email-indicator-register');
		const passwordIndicator = document.getElementById('password-indicator-register');
		const submitButton = document.getElementById('register-btn');

		const isEmailValid = emailIndicator.classList.contains('valid');
		const isPasswordValid = passwordIndicator.classList.contains('valid');
		console.log('checkIndicatorsRegister  : ');
		console.log(isEmailValid);
		console.log(isPasswordValid)
		if (isEmailValid && isPasswordValid) {
			console.log("enable button")
			submitButton.removeAttribute('disabled');
		} else {
			submitButton.setAttribute('disabled', 'disabled');
		}
	}

	const togglePasswordRegister = document.getElementById('togglePasswordRegister');
	const passwordFieldRegister = document.getElementById('register-pass');

	togglePasswordRegister.addEventListener('click', function () {
		const type = passwordFieldRegister.getAttribute('type') === 'password' ? 'text' : 'password';
		passwordFieldRegister.setAttribute('type', type);

		if (type === 'password') {
			togglePasswordRegister.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
		} else {
			togglePasswordRegister.innerHTML = '<i class="fa-solid fa-eye"></i>';
		}
	});
});

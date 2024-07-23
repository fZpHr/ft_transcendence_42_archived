document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.warp-input input');
    
    inputs.forEach(input => {
        const warpInput = input.parentElement;
        const validIndicator = warpInput.querySelector('.valid-indicator');
        
        const checkInput = () => {
            const label = input.nextElementSibling;
            if (input.value !== '') {
                label.classList.add('filled');
                validIndicator.style.opacity = '1';
            } else {
                label.classList.remove('filled');
                validIndicator.style.opacity = '0';
            }
        };
        
        const checkEmail = () => {
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
        
        const checkPasswordStrength = () => {
            if (validatePasswordStrength(input.value)) {
                validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
                validIndicator.classList.remove('invalid');
                validIndicator.classList.add('valid');
            } else {
                validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
                validIndicator.classList.remove('valid');
                validIndicator.classList.add('invalid');
            }
        };
        
        input.addEventListener('input', () => {
            checkInput();
            
            if (input.type === 'email') {
                checkEmail();
            } else if (input.id === 'login-pass' || input.id === 'register-pass') {
                checkPasswordStrength();
            }
        });
        
        input.addEventListener('focusout', checkInput);
    });
    
    function validateEmail(email) {
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
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginBtn.addEventListener('click', () => {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
    
    registerBtn.addEventListener('click', () => {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });
    
    const btn42 = document.getElementById('btn-42');
    
    btn42.addEventListener('click', () => {
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-484f3af86d262f1a98fc094a4116618c1c856647f7eb4232272966a9a3e83193&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fregister-42%2F&response_type=code';
    });
    
    const togglePasswordLogin = document.getElementById('togglePasswordLogin');
    const passwordFieldLogin = document.getElementById('login-pass');
    
    togglePasswordLogin.addEventListener('click', function () {
        const type = passwordFieldLogin.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordFieldLogin.setAttribute('type', type);
    
        if (type === 'password') {
            togglePasswordLogin.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            togglePasswordLogin.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    });
    
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

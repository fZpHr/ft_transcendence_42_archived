// document.addEventListener('DOMContentLoaded', async function () {
function loadProfile() {
	handlerUpdatePP();
	handlerUpdateData();
	toggleBackPanel();
	toggleBackPasswordPanel();
	toggleAllPasswords();
};
// });


// ===================== Profile utils =====================

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

async function APIupdatePP(file) {
	return new Promise(async(resolve, reject) => { 
		const formData = new FormData();
		formData.append('avatar', file);
		let resp = await fetch('/api/updateImg/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
			},
			mode: 'same-origin',
			body: formData,
		});
		resp = await resp.json();
		resolve(resp);
	});
}

async function APIudpateData(username, email) {
	return fetch("/api/updateData/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, email }),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}

async function APIupdatePassword(old_password, new_password, confirm_password) {
	return fetch("/api/updatePassword/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ old_password, new_password, confirm_password }),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}


// ===================== Profile handler =====================

async function handlerUpdatePP() {
	try {
		document.getElementById('upload-avatar-label').addEventListener('click', function () {
			document.getElementById('uploadAvatar').click();
		});

		document.getElementById('uploadAvatar').addEventListener('change', async function () {
			const file = this.files[0];
			if (file) {
				let resp = await APIupdatePP(file);
				if (resp.status == 400)
					return alert('An error occurred while updating avatar');
				document.getElementById('profile-avatar').src = resp.new_avatar_url;
			}
		});
	} catch (e) {
		console.error(e);
	}
}

async function handlerUpdateData() {
	document.getElementById('edit-btn').addEventListener('click', function () {
		document.getElementById('edit-panel').classList.toggle('active');
		toggleEditPanel();
	});
	
	document.getElementById('edit-password-btn').addEventListener('click', function () {
		document.getElementById('edit-password-panel').classList.toggle('active');
	});
}

async function toggleBackPanel() {
	try {
		let backBtnEdit = document.getElementById('back-btn-edit');
		backBtnEdit.addEventListener('click', function () {
			let editPanel = document.getElementById('edit-panel');
			editPanel.classList.toggle('active');
		});
	} catch (e) {
		console.error(e);
	}
}

async function toggleBackPasswordPanel() {
	try {
		let backBtnPassword = document.getElementById('back-btn-edit-password');
		backBtnPassword.addEventListener('click', function () {
			let editPasswordPanel = document.getElementById('edit-password-panel');
			editPasswordPanel.classList.toggle('active');
		});
	} catch (e) {
		console.error(e);
	}
}


// ===================== Profile toggle =====================

async function toggleEditPanel() {
	try {
		let editData = document.getElementById('submit-edit-data');
		editData.addEventListener('click', async (e) => {
			e.preventDefault();
			try {
				let username = editData.form.username.value;
				let email = editData.form.email.value;
				let resp = await APIudpateData(username, email);
				if (resp.success == false) {
					let errorBox = document.getElementById('error-content');
					errorBox.textContent = resp.error;
					return;
				}
				document.getElementById('username').textContent = resp.new_username;
				document.getElementById('username-profil').textContent = resp.new_username;
				document.getElementById('email').textContent = resp.new_email;
			} catch (e) {
				console.error(e);
			}
		});

		let editPassword = document.getElementById('submit-edit-password');
		editPassword.addEventListener('click', async (e) => {
			e.preventDefault();
			try {
				let old_password = editPassword.form.old_password.value;
				console.log(old_password);
				let new_password = editPassword.form.new_password.value;
				console.log(new_password);
				let confirm_password = editPassword.form.confirm_password.value;
				console.log(confirm_password);
				let resp = await APIupdatePassword(old_password, new_password, confirm_password);
				if (resp.success == false) {
					let errorBox = document.getElementById('error-content-pass');
					errorBox.textContent = resp.error;
					return;
				}
				document.getElementById('edit-password-panel').classList.toggle('active');
			} catch (e) {
				console.error(e);
			}
		});

	} catch (e) {
		console.error(e);
	}
}

async function toggleAllPasswords() {
    try {
        // Sélectionne tous les boutons pour basculer la visibilité du mot de passe
        let toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Détermine l'ID du champ de mot de passe associé
                let passwordFieldId = button.id.replace('toggle-', '');
                let passwordField = document.getElementById(passwordFieldId);
                
                // Bascule le type de l'input et l'icône
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    button.innerHTML = '<i class="fa-solid fa-eye"></i>'; // Change l'icône pour "oeil ouvert"
                } else {
                    passwordField.type = 'password';
                    button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'; // Change l'icône pour "oeil barré"
                }
            });
        });
    } catch (e) {
        console.error(e); // Affiche l'erreur dans la console si nécessaire
    }
}

loadProfile();
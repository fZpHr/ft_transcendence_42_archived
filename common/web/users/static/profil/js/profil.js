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
document.getElementById('upload-avatar-label').addEventListener('click', function () {
	document.getElementById('uploadAvatar').click();
});

document.getElementById('uploadAvatar').addEventListener('change', async function () {
	const file = this.files[0];
	if (file) {
		const formData = new FormData();
		formData.append('avatar', file);
		const csrftoken = getCookie('csrftoken');
		let resp = await fetch('http://localhost:8000/api/updateImg/', {
			method: 'POST',
			body: formData,
			headers: {
				'X-CSRFToken': csrftoken
			},
			mode: 'same-origin'
		})
		resp = await resp.json();
		if (resp.status == 400)
			return alert('An error occurred while updating avatar');
		document.getElementById('profile-avatar').src = resp.new_avatar_url;
	}
});

document.getElementById('edit-btn').addEventListener('click', function () {
	document.getElementById('edit-panel').classList.toggle('active');
});

document.getElementById('edit-password-btn').addEventListener('click', function () {
	document.getElementById('edit-password-panel').classList.toggle('active');
});

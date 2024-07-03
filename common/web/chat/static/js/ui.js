// ui.js

function toggleChatPanel() {
	var chatPanel = document.getElementById('chat-panel');
	chatPanel.classList.toggle('active');
	if (chatPanel.classList.contains('active')) {
		openChatPanel();
	} else {
		closeChatPanel();
	}
}

function openChatPanel() {
	var chatPanel = document.getElementById('chat-panel');
	chatPanel.classList.add('opening');
	setTimeout(function () {
		chatPanel.classList.remove('opening');
	}, 500);
}

function closeChatPanel() {
	var chatPanel = document.getElementById('chat-panel');
	chatPanel.classList.add('closing');
	setTimeout(function () {
		chatPanel.classList.remove('active', 'closing');
	}, 300);
}

function showContactList() {
	var chatBox = document.getElementById('chat-box');
	var contactsList = document.getElementById('contacts-list');
	var chatHeader = document.getElementById('chat-header');
	var contactProfileImg = document.getElementById('contact-profile-img');
	var headerDivider = document.getElementById('header-divider');
	var backBtn = document.getElementById('back-btn');
	var closeBtn = document.getElementById('close-btn');
	var searchBar = document.getElementById('search-bar');

	contactsList.style.display = 'block';
	chatBox.style.display = 'none';
	searchBar.style.display = 'block';
	chatHeader.querySelector('h3').textContent = 'Chat';
	contactProfileImg.style.display = 'none';
	headerDivider.style.display = 'none';
	backBtn.style.display = 'none';
	closeBtn.style.display = 'block';
}

function openChatUI(contactId, contactName, contactImg) {
	var chatBox = document.getElementById('chat-box');
	var chatHeader = document.getElementById('chat-header');
	var contactProfileImg = document.getElementById('contact-profile-img');
	var headerDivider = document.getElementById('header-divider');
	var backBtn = document.getElementById('back-btn');
	var closeBtn = document.getElementById('close-btn');
	var searchBar = document.getElementById('search-bar');
	var chatMessages = document.getElementById('chat-messages');

	chatMessages.innerHTML = '';

	var contactsList = document.getElementById('contacts-list');
	contactsList.style.display = 'none';
	chatBox.style.display = 'block';
	searchBar.style.display = 'none';
	chatHeader.querySelector('h3').textContent = contactName;
	contactProfileImg.setAttribute('src', contactImg);
	contactProfileImg.style.display = 'block';
	headerDivider.style.display = 'block';
	backBtn.style.display = 'block';
	closeBtn.style.display = 'none';
}

function appendMessage(msg, isCurrentUser) {
	var chatMessages = document.getElementById('chat-messages');
	var messageDiv = document.createElement('div');
	messageDiv.classList.add('message');
	if (isCurrentUser) {
		messageDiv.classList.add('my-message');
	} else {
		messageDiv.classList.add('their-message');
	}
	messageDiv.textContent = msg.content;
	chatMessages.appendChild(messageDiv);
}

function showErrorMessage(errorMessage) {
	var chatMessages = document.getElementById('chat-messages');
	var errorMessageDiv = document.createElement('div');
	errorMessageDiv.classList.add('message', 'error-message');
	errorMessageDiv.textContent = errorMessage;
	chatMessages.appendChild(errorMessageDiv);
}

function displayChatUsers(chatUsers) {
	var userContainer = document.getElementById('contacts-list');
	userContainer.innerHTML = '';

	chatUsers.forEach(user => {
		var userHtml = `
            <div class="contact" data-contact-id="${user.id}" data-contact-img="${user.img}">
                <a href="/visited_profil/${user.username}/">
                    <img src="${user.img.startsWith('/') ? '/static' + user.img : user.img}" class="contact-img" alt="${user.username}">
                </a>
                <span class="contact-name">${user.username}</span>
            </div>
        `;
		userContainer.innerHTML += userHtml;
	});
}

function openSocialPanel() {
	var socialPanel = document.getElementById('social-panel');
	socialPanel.classList.add('opening');
	setTimeout(function () {
		socialPanel.classList.remove('opening');
	}, 500);
}

function closeSocialPanel() {
	var socialPanel = document.getElementById('social-panel');
	socialPanel.classList.add('closing');
	setTimeout(function () {
		var socialContainer = document.getElementById('social-container');
		socialContainer.classList.remove('active', 'closing');
	}, 300);
}

function displaySocialUsers(users) {
	var userContainer = document.querySelector('#profile-info .profile-info-item');
	userContainer.innerHTML = '';

	users.forEach(user => {
		var userHtml = `
            <div class="user">
                <div class="data">
                    <a href="/visited_profil/${user.username}/">
                        <img src="${user.img.startsWith('/') ? user.img : user.img}" alt="pp">
                    </a>
                    <span>${user.username}</span>
                </div>
        `;
		if (user.status === 2) {
			userHtml += `
                <a href="#" class="add-friend" data-id="${user.id}"><i class="fa-solid fa-user-plus"></i></a>
            `;
		}
		else if (user.status === 3) {
			userHtml += `
                <i class="fa-regular fa-paper-plane"></i>
            `;
		} else if (user.status === 1) {
			userHtml += `
                <i class="fa-solid fa-hourglass-half"></i>
            `;
		} else if (user.status === 0) {
			userHtml += `
                <a href="#" class="add-friend" data-id="${user.id}"><i class="fa-solid fa-plus"></i></a>
            `;
		}
		userHtml += `
            </div>
        `;
		userContainer.innerHTML += userHtml;
	});

	document.querySelectorAll('.add-friend').forEach(button => {
		button.addEventListener('click', async (event) => {
			event.preventDefault();
			const friendId = button.getAttribute('data-id');
			try {
				const result = await addFriend(friendId);
				const userDiv = button.closest('.user');
				button.remove();
				const paperPlaneIcon = document.createElement('i');
				paperPlaneIcon.className = result.status ? 'fa-regular fa-paper-plane' : 'fa-solid fa-hourglass-half';
				userDiv.appendChild(paperPlaneIcon);
			} catch (error) {
				console.error('Failed to add friend:', error);
			}
		});
	});
}

function toggleSocialPanel() {
	var socialContainer = document.getElementById('social-container');
	socialContainer.classList.toggle('active');
	if (socialContainer.classList.contains('active')) {
		openSocialPanel();
	} else {
		closeSocialPanel();
	}
}
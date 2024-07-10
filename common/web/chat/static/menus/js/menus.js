document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('pre-menu-btn').addEventListener('click', toggleRadialMenu);
});

// ============================== REQUEST API PART ==============================

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

async function getCurrentUser() {
	try {
		let response = await fetch('http://localhost:8000/api/@me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		let user = await response.json();
		return user;
	} catch (error) {
		console.error('Failed to get current user', error);
		return null;
	}
}

async function getChatUsers() {
	try {
		let response = await fetch('http://localhost:8000/api/getChatUser', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		return await response.json();
	} catch (error) {
		console.error('Failed to get chat users', error);
		throw error;
	}
}

async function getSocialUsers() {
    console.log('getSocialUsers');
	try {
		let response = await fetch(`http://localhost:8000/api/getSocialUser`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		let users = await response.json();
		return users;
	} catch (error) {
		console.error('Failed to get social users', error);
		throw error;
	}
}

async function getMessages(contactId) {
    try {
        let response = await fetch(`http://localhost:8000/api/getMessages?contactId=${contactId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let messages = await response.json();
        return messages;
    } catch (error) {
        console.error('Failed to get messages', error);
        throw error;
    }
}

// ============================== CHAT PART ==============================

function handlersBackClick() {
    let backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', function () {
        toggleChatMenu();
    });
}

function handlersRemoveRelation() {
    let head = document.getElementById('btn-head')
    for (const link of head.children) {
        link.addEventListener('click', async(event) => {
            event.preventDefault();
            var socialUserId = event.target.closest('button').getAttribute('data-id');
            var friendStatus = event.target.closest('button').getAttribute('data-status');
            console.log('Social User ID:', socialUserId);
            console.log('Friend Status:', friendStatus);
            let resp = await fetch(`http://localhost:8000/api/updateSocialStatus/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    socialUserId: socialUserId,
                    friendStatus: friendStatus,
                }),
            });
            resp = await resp.json();
            toggleChatMenu();
        });
    }
}

function handlersSendMessage(contactId) {
    let sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', async () => {
        let messageInput = document.getElementById('message-input');
        let message = messageInput.value;
        if (message) {
            let resp = await fetch(`http://localhost:8000/api/sendMessage/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactId: contactId,
                    message: message,
                }),
            });
            resp = await resp.json();
            messageInput.value = '';
            let chatMessages = document.getElementById('chat-messages');
            var msgDiv = document.createElement('div');
            msgDiv.className = 'message';
            if (resp.sender === contactId) {
                msgDiv.classList.add('their-message');
            } else {
                msgDiv.classList.add('my-message');
            }
            msgDiv.textContent = message;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }
    });
}

function removeGameInvites() {
    let chatMessages = document.getElementById('chat-messages');
    let gameInvites = chatMessages.getElementsByClassName('game-invite');
    while (gameInvites[0]) {
        gameInvites[0].parentNode.removeChild(gameInvites[0]);
    }
}

function handlersInviteResp(contactId) {
    console.log('handlersInviteResp');
    try {
        let chatMessages = document.getElementById('chat-messages');
        chatMessages.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-update')) {
                let status = 0;
                if (event.target.classList.contains('fa-check')) {
                    status = 2;
                } else if (event.target.classList.contains('fa-xmark')) {
                    status = -1;
                }
                let resp = await fetch(`http://localhost:8000/api/updateInviteStatus/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contactId: contactId,
                        status: status,
                    }),
                });
                resp = await resp.json();
                console.log('Invite response:', resp);
            }
        });
    } catch (error) {
        console.error('Failed to update invite status:', error);
    }
}


function handlersGameInvite(contactId) {
    let inviteBtn = document.getElementById('invite-btn');
    inviteBtn.addEventListener('click', async () => {
        console.log('Game invite button clicked');
        let resp = await fetch(`http://localhost:8000/api/sendInvite/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactId: contactId,
            }),
        });
        resp = await resp.json();
        removeGameInvites();
        let chatMessages = document.getElementById('chat-messages');
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.classList.add('my-message');
        msgDiv.classList.add('game-invite');
        msgDiv.classList.add('my-message');
        let gameDiv = document.createElement('div');
        gameDiv.className = 'game-invite-head';
        gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
        msgDiv.appendChild(gameDiv);
        let chooseGamesDiv = document.createElement('div');
        chooseGamesDiv.style.width = '100px';
        chooseGamesDiv.className = 'choose-games';
        chooseGamesDiv.innerHTML += '<span>Pending</span>';
        msgDiv.appendChild(chooseGamesDiv);
        chatMessages.appendChild(msgDiv);
        handlersInviteResp(contactId);
    });
}

function getInvitationStatus(msgDiv, message) {
    let chooseGamesDiv = document.createElement('div');
    chooseGamesDiv.style.width = '100px';
    chooseGamesDiv.className = 'choose-games';

    if (message.status == 0) {
        chooseGamesDiv.innerHTML += '<span>Pending</span>';
    } else if (message.status == 1) {
        chooseGamesDiv.innerHTML += '<button class="btn btn-update" data-tooltip="Accept game"><i class="fa-solid fa-check"></i></button>'
        chooseGamesDiv.innerHTML += '<button class="btn btn-update" data-tooltip="Refuse game"><i class="fa-solid fa-xmark"></i></button>'
    } else if (message.status == -1) {
        chooseGamesDiv.innerHTML += '<span>Declined</span>';
    } else if (message.status == 2){
        chooseGamesDiv.innerHTML += '<button class="btn btn-update" data-tooltip="Join lobby">Join</button>';
    }
    msgDiv.appendChild(chooseGamesDiv);
}

function innerMessages(contactId) {
    let chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    let messages = getMessages(contactId);
    messages.then(messages => {
        messages.forEach(message => {
            var msgDiv = document.createElement('div');
            msgDiv.className = 'message';
            if (message.type == 0) {
                if (message.sender == contactId) {
                    msgDiv.classList.add('their-message');
                } else {
                    msgDiv.classList.add('my-message');
                }
                msgDiv.textContent = message.content;
            } else {
                msgDiv.classList.add('game-invite');
                console.log('Game invite message:', message);
                if (message.status == 1) {
                    msgDiv.classList.add('their-message');
                } else {
                    msgDiv.classList.add('my-message');
                }
                let gameDiv = document.createElement('div');
                gameDiv.className = 'game-invite-head';
                gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
                msgDiv.appendChild(gameDiv);
                getInvitationStatus(msgDiv, message);
            }
            chatMessages.appendChild(msgDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

function handlersContactClick() {
    document.querySelectorAll('.contact').forEach(contact => {
        contact.addEventListener('click', async(event) => {
            let contactId = event.target.closest('.contact').getAttribute('data-contact-id');
            var chatContainer = document.getElementById('chat-panel');
            chatContainer.innerHTML = `
                <div id="chat-header">
                    <div class="chat-head-info">
                        <div class="user-head">
                            <h3>User : ${contactId}</h3>
                        </div>
                        <div class="btn-head" id="btn-head">
                            <button id="block-btn" class="btn btn-update" data-tooltip="Block this user" data-id="${contactId}" data-status="-2"><i class="fa-solid fa-user-slash"></i></button>
                            <button id="delete-btn" class="btn btn-update" data-tooltip="Delete your relation" data-id="${contactId}" data-status="-1"><i class="fa-solid fa-user-minus"></i></button>
                        </div>
                        <div class="btn-utils">
                            <button id="back-btn" class="btn btn-link"><i class="fa-solid fa-right-long"></i></button>
                        </div>
                    </div>
                </div>
                <div id="header-divider"></div>
                <div id="chat-box">
                    <div id="chat-messages"></div>
                    <div id="chat-input">
                        <input type="text" id="message-input" placeholder="Tapez votre message...">
                        <button class="action-btn" id="send-btn"><i class="fas fa-paper-plane"></i></button>
                        <button class="action-btn" id="invite-btn"><i class="fa-solid fa-gamepad"></i></button>
                    </div>
                </div>
            `;
            innerMessages(contactId);
            handlersBackClick();
            handlersGameInvite(contactId);
            handlersRemoveRelation();
            handlersSendMessage(contactId);
        });
    });
}


function displayChatUsers(chatUsers) {
	var userContainer = document.getElementById('contacts-list');
	userContainer.innerHTML = '';

	chatUsers.forEach(user => {
		var imgLink = ''
	if (user.img.startsWith('profile_pics/')) {
		imgLink = '/media/' + user.img;
	} else {
		imgLink = user.img;
	}
    var userHtml = `
            <div class="contact" data-contact-id="${user.id}" data-contact-img="${user.img}">
                <div class="contact-status ${user.is_online ? 'online' : 'offline'}">  
                    <a href="/visited_profil/${user.username}/">
                        <img src="${imgLink}" class="contact-img" alt="${user.username}">
                    </a>
                    <span class="contact-name">${user.username}</span>
                </div>
                <div class="contact-online-status ${user.is_online ? 'online' : 'offline'}">
                </div>
            </div>
        `;
		userContainer.innerHTML += userHtml;
	});
    handlersContactClick();
}

async function loadChatUsers() {
    try {
        const chatUsers = await getChatUsers();
        displayChatUsers(chatUsers);
        
    } catch (error) {
        console.error('Failed to load chat users:', error);
    }
}

function toggleChatMenu() {
    console.log('toggleChatMenu');
    let chatMenus = document.getElementById('pannel');
    chatMenus.innerHTML = `
        <div id="chat-container">
            <div id="chat-panel">
                <div id="chat-header">
                    <div class="chat-head-info">
                        <h3>Contacts</h3>
                        <button id="close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                        <button id="back-btn" class="btn btn-link" style="display: none;"><i
                                class="fa-solid fa-right-long"></i></button>
                    </div>
                </div>
                <div id="header-divider" style="display: none;"></div>
                <div id="search-bar">
                    <input type="text" id="contact-search" placeholder="Rechercher...">
                    <i class="fas fa-search"></i>
                </div>
                <div id="contacts-list">
                </div>
                <div id="chat-box" style="display: none;">
                    <div id="chat-messages"></div>
                    <div id="chat-input">
                        <input type="text" id="message-input" placeholder="Tapez votre message...">
                        <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatMenus.classList.add('active');
    let chatPanel = document.getElementById('chat-panel');
    chatPanel.classList.add('active');
    chatMenus.addEventListener('click', function (e) {
        if (e.target.id === 'close-btn') {
            chatMenus.classList.remove('active');
            chatMenus.innerHTML = '';
        }
    });
    let closeBtn = document.getElementById('close-btn');
    closeBtn.addEventListener('click', function () {
        chatMenus.classList.remove('active');
        chatMenus.innerHTML = '';
    });
    console.log('chatMenus:', chatMenus);
    loadChatUsers();
}

// ============================== SOCIAL PART ==============================

function getSocialStatus(user) {
    console.log('user.friend_status:', user.friend_status);
    user.friend_status = parseInt(user.friend_status);
    switch (user.friend_status) {
        case 3:
            return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}"><i class="fa-regular fa-paper-plane"></i></a>`;
        case 2:
            return `
                <a href="#" class="add-friend" data-id="${user.id}" data-status="-1"><i class="fa-solid fa-xmark"></i></a>
                <a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}"><i class="fa-solid fa-user-plus"></i></a>
            `;
        case 1:
            return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}"><i class="fa-solid fa-hourglass-start"></i></a>`;
        case 0:
            return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}"><i class="fa-solid fa-plus"></i></a>`;
        case -2:
            return `<a href="#" class="add-friend" data-id="${user.id}" data-status="-1"><i class="fa-solid fa-user-slash"></i></a>`;
        default:
            return '';
    }
}

function handlersUpdateStatus() {
    document.querySelectorAll('.add-friend').forEach(link => {
        link.addEventListener('click', async(event) => {
            event.preventDefault();
            var socialUserId = event.target.closest('a').getAttribute('data-id');
            var friendStatus = event.target.closest('a').getAttribute('data-status');
            console.log('Social User ID:', socialUserId);
            console.log('Friend Status:', friendStatus);
            let resp = await fetch(`http://localhost:8000/api/updateSocialStatus/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    socialUserId: socialUserId,
                    friendStatus: friendStatus,
                }),
            });
            resp = await resp.json();
            loadSocialUsers();
        });
    });
}

function displaySocialUsers(users) {
    var userContainer = document.querySelector('#profile-info .profile-info-item');
    userContainer.innerHTML = '';

    users.forEach(user => {
        var userHtml = `
            <div class="user">
                <div class="data">
                    <a href="/visited_profil/${user.username}/">
                        <img class="${user.is_online ? "online" : "offline"}" src="${user.img.startsWith('/') ? user.img : user.img}" alt="pp">
                    </a>
                    <span>${user.username}</span>
                </div>
                ${getSocialStatus(user)}
            </div>
        `;
        userContainer.innerHTML += userHtml;
    });
    handlersUpdateStatus();
}

async function loadSocialUsers() {
    try {
        const socialUsers = await getSocialUsers();
        displaySocialUsers(socialUsers);
    } catch (error) {
        console.error('Failed to load social users:', error);
    }
}

function toggleSocialMenu() {
	let socialMenu = document.getElementById('pannel');
    socialMenu.innerHTML = `
        <div id="social-container">
            <div id="social-panel">
                <div id="social-header">
                    <div class="social-head-info">
                        <a href="/profil/">
                        </a>
                        <h3>bberkrou</h3>
                        <button id="social-close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
                <div id="profile-info">
                    <div id="profile-search-bar">
                        <input type="text" id="profile-contact-search" placeholder="Rechercher...">
                        <i class="fas fa-search"></i>
                    </div>
                    <div id="profile-info">
                        <div class="profile-info-item">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    socialMenu.classList.add('active');
    let socialContainer = document.getElementById('social-container');
    socialContainer.classList.add('active');
    socialMenu.addEventListener('click', function (e) {
        if (e.target.id === 'close-btn') {
            socialMenu.classList.remove('active');
            socialMenu.innerHTML = '';
        }
    });
    let socialCloseBtn = document.getElementById('social-close-btn');
    socialCloseBtn.addEventListener('click', function () {
        socialMenu.classList.remove('active');
        socialMenu.innerHTML = '';
    });
    loadSocialUsers();
}

// ============================== RADIAL MENU PART ==============================

function toggleRadialMenu() {
    let radialMenu = document.getElementById('radial-menu');

    if (radialMenu.classList.contains('active')) {
        radialMenu.classList.remove('active');
        radialMenu.innerHTML = '';
    } else {
        radialMenu.innerHTML = `
            <div>
                <i id="chat-btn" class="fas fa-comment-alt"></i>
            </div>
            <div>
                <i id="social-btn" class="fas fa-user"></i>
            </div>
        `;
        radialMenu.classList.add('active');
        radialMenu.addEventListener('click', function (e) {
            if (e.target.id === 'chat-btn') {
                toggleChatMenu();
            } else if (e.target.id === 'social-btn') {
                toggleSocialMenu();
            }
        });
    }
}
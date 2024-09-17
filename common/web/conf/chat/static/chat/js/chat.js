// chat.js

// ============================== CHAT PART ==============================

async function updateInviteStatusUI(status) {
    try {
        // console.log('status:', status);
        let chatMessages = document.getElementById('chat-messages');
        let gameInvites = chatMessages.getElementsByClassName('game-invite');
        for (let i = 0; i < gameInvites.length; i++) {
            // console.log('gameInvites[i]:', gameInvites[i]);
            let gameInvite = gameInvites[i];
            let chooseGamesDiv = gameInvite.getElementsByClassName('choose-games')[0];
            // console.log('status:', status);
            status == 2 ? chooseGamesDiv.innerHTML = '<button class="btn btn-join" data-tooltip="Join lobby">Join</button>' : chooseGamesDiv.innerHTML = '<span>Declined</span>';
        }
    } catch (error) {
        console.error('Failed to updateInviteStatusUI:', error);
    }
}

function handlersInviteResp(contactId) {
    try {
        let chatMessages = document.getElementById('chat-messages');
        chatMessages.addEventListener('click', async (event) => {
            // console.log('event.target:', event.target);
            if (event.target.classList.contains('btn-update')) {
                
                let status = event.target.getAttribute('data-tooltip');
                status = status === 'Accept game' ? 2 : -1;
                let resp = await fetch(`/api/updateInviteStatus/`, {
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
                updateInviteStatusUI(status);
                let msg = status === 2 ? 'Game accepted' : 'Game declined';
                sendWebSocketMessage(msg, userId, contactId, wsChat);
            } else if (event.target.classList.contains('btn-join')) {
                htmx.ajax('GET', '/game/pong/privGame/?opponent=' + contactId, {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', '/game/pong/privGame/?opponent=' + contactId);
                });
            }
        });
    } catch (error) {
        console.error('Failed to update invite status:', error);
    }
}


function handlersGameInvite(contactId, wsChat) {
    try {
        let inviteBtn = document.getElementById('invite-btn');
    
        inviteBtn.addEventListener('click', async () => {
            let resp = await fetch(`/api/sendInvite/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactId: contactId,
                }),
            });
            if (resp.status === 201)
            {
                errorInviteHandler();
                return;
            }
            resp = await resp.json();
            let message = 'Game invite';
            sendWebSocketMessage(message, userId, contactId , wsChat);
            removeGameInvites();
            let chatMessages = document.getElementById('chat-messages');
            var msgDiv = document.createElement('div');
            msgDiv.className = 'message';
            msgDiv.classList.add('my-message');
            msgDiv.classList.add('game-invite');
            let gameDiv = document.createElement('div');
            gameDiv.className = 'game-invite-head';
            gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
            msgDiv.appendChild(gameDiv);
            let chooseGamesDiv = document.createElement('div');
            chooseGamesDiv.className = 'choose-games';
            chooseGamesDiv.innerHTML += '<span>Pending</span>';
            msgDiv.appendChild(chooseGamesDiv);
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        });
    } catch (error) {
        console.error('Failed to handlersGameInvite:', error);
    }
}

function errorInviteHandler() {
    removeGameInvites();
    let chatMessages = document.getElementById('chat-messages');
    var parentDiv = document.createElement('div');
    parentDiv.classList.add('error-parent-invite');
    parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';
    var msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.classList.add('error-message');
    msgDiv.classList.add('game-invite');
    let gameDiv = document.createElement('div');
    gameDiv.className = 'game-invite-head';
    gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
    msgDiv.appendChild(gameDiv);
    let chooseGamesDiv = document.createElement('div');
    chooseGamesDiv.className = 'choose-games';
    chooseGamesDiv.innerHTML += '<span>Error</span>';
    msgDiv.appendChild(chooseGamesDiv);
    parentDiv.appendChild(msgDiv);
    chatMessages.appendChild(parentDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}
// ============================== CHAT utils ==============================


function removeGameInvites() {
    let chatMessages = document.getElementById('chat-messages');
    let gameInvites = chatMessages.getElementsByClassName('game-invite');
    while (gameInvites[0]) {
        gameInvites[0].parentNode.removeChild(gameInvites[0]);
    }
}

function getInvitationStatus(msgDiv, message) {
    let chooseGamesDiv = document.createElement('div');
    chooseGamesDiv.className = 'choose-games';
    // console.log('message:', message);
    const statusActions = {
        0: '<span>Pending</span>',
        1: '<button class="btn btn-update" data-tooltip="Accept game"><i class="fa-solid fa-check"></i></button>'
            + '<button class="btn btn-update" data-tooltip="Refuse game"><i class="fa-solid fa-xmark"></i></button>',
        '-1': '<span>Declined</span>',
        2: '<button class="btn btn-join" data-tooltip="Join lobby">Join</button>'
    };
    chooseGamesDiv.innerHTML = statusActions[message.status] || '<span>Unknown</span>';
    msgDiv.appendChild(chooseGamesDiv);
}


// ============================== CHAT display ==============================

async function displayChatPannel() {
    try {
        let chatMenus = document.getElementById('pannel');
        chatMenus.classList.add('active');
    } catch (error) {
        console.error('Failed to displayChatPannel', error);
    }
}

// ============================== CHAT hide ==============================



// ============================== CHAT Inner ==============================

async function innerChatPannel() {
    try {
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
    } catch (error) {
        console.error('Failed to innnerChatPannel', error);
    } 
}

async function innerChatUsers(chatUsers) {
    try {
        let userChatContainer = document.getElementById('contacts-list');
        userChatContainer.innerHTML = chatUsers.map(user => `
            <div class="contact" data-contact-id="${user.id}">
                <div class="contact-status ${user.is_online ? 'online' : 'offline'}">
                    <a href="/visited_profil/${user.username}/">
                        <img  src="${user.img.startsWith('profile_pics/') ? '/media/' + user.img : user.img}" class="contact-img" alt="${user.username}">
                        ${user.notif > 0 ? `<span class="mark-notif-chat">+${user.notif}</span>` : ''}
                    </a>
                    <span class="contact-name">${user.username}</span>
                </div>
                <div class="contact-online-status ${user.is_online ? 'online' : 'offline'}">
                </div>
            </div>
        `).join('');
        const anchorTags = userChatContainer.querySelectorAll('a');
        anchorTags.forEach(anchor => {
            anchor.addEventListener('click', async (event) => {
                event.preventDefault();
                let href = event.currentTarget.href;
                htmx.ajax('GET', href, {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', href);
                });
            });
        });
    } catch (error) {
        console.error('Failed to innerChatUsers', error);
    }
}


async function innerChatChanel(contactId, contactUser) {
    try {
        // console.log('inner chanel call', contactId, contactUser);
        var chatContainer = document.getElementById('chat-panel');
        chatContainer.innerHTML = `
            <div id="chat-header">
                <div class="chat-head-info">
                    <div class="user-head" id="pdp-chat-panel">
                        <a href="/visited_profil/${contactUser.username}/">
                            <img src="${contactUser.img.startsWith('profile_pics/') ? '/media/' + contactUser.img : contactUser.img}" alt="pp">
                        </a>
                        <span>${contactUser.username}</span>
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
        const anchorTags = chatContainer.querySelectorAll('a');
        anchorTags.forEach(anchor => {
            anchor.addEventListener('click', async (event) => {
                event.preventDefault();
                let href = event.currentTarget.href;
                htmx.ajax('GET', href, {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', href);
                });
            });
        });
    } catch (error) {
        console.error('Failed to innerChatChanel', error);
    }
}

async function innerMessages(contactId, messages) {
    try {
        let chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        messages.forEach(message => {
            var msgDiv = document.createElement('div');
            msgDiv.className = 'message';

            if (message.type == 0) {
                message.sender == contactId ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');
                msgDiv.textContent = message.content;
            } 
            else {
                message.status == 1 ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');
                msgDiv.classList.add('game-invite');
                let gameDiv = document.createElement('div');
                gameDiv.className = 'game-invite-head';
                gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
                msgDiv.appendChild(gameDiv);
                getInvitationStatus(msgDiv, message);
            }
            chatMessages.appendChild(msgDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Failed to innerMessages', error);
    }
}

// ============================== CHAT handle ==============================

async function handleCloseChatPannel() {
    try {
        const chatCloseBtn = document.getElementById('close-btn');
        chatCloseBtn.addEventListener('click', async function () {
            await updateNotifChat();
            hidePanel();
            displaySubMenus();
            disableNotifSubMenus();
        });
    } catch (error) {
        console.error('Failed to handleCloseChatPannel', error);
    }
}

async function handleOpenChatPannel() {
    try {
        const chatContainer = document.getElementById('chat-panel');
        chatContainer.classList.add('active');
    } catch (error) {
        console.error('Failed to handleOpenChatPannel', error);
    }
}

async function handleCloseChatChanel(contactId) {
    try {
        const backBtn = document.getElementById('back-btn');
        const blockBtn = document.getElementById('block-btn');
        const deleteBtn = document.getElementById('delete-btn');
        backBtn.addEventListener('click', async function () {
            await APIclearNotifChatFor(contactId);
            // console.log('click');
            wsChat.close();
            toggleChatMenu(contactId);
        });
        blockBtn.addEventListener('click', async function () {
            await APIclearNotifChatFor(contactId);
            console.log('click');
            wsChat.close();
            toggleChatMenu(contactId);
        });
        deleteBtn.addEventListener('click', async function () {
            await APIclearNotifChatFor(contactId);
            console.log('click');
            wsChat.close();
            toggleChatMenu(contactId);
        });
    } catch (error) {
        console.error('Failed to handleCloseChatChanel', error);
    }

}

async function handlersContactClick() {
    try {
        document.querySelectorAll('.contact').forEach(contact => {
            contact.addEventListener('click', async(event) => {
                let contactId = event.target.closest('.contact').getAttribute('data-contact-id');
                APIclearNotifChatFor(contactId);
                toggleChanelChat(contactId);
            });
        });
    } catch (error) {
        console.error('Failed to handlersContactClick', error);
    }
}

async function handlersRemoveBlockRelation(userMsg) {
    try {
        let head = document.getElementById('btn-head')
        for (const link of head.children) {
            link.addEventListener('click', async(event) => {
                event.preventDefault();
                var socialUserId = event.target.closest('button').getAttribute('data-id');
                var friendStatus = event.target.closest('button').getAttribute('data-status');
                await APIupdateSocialStatus(socialUserId, friendStatus);
                toggleChatMenu();
            });
        }
    } catch (error) {
        console.error('Failed to handlersRemoveRelation', error);
    }
}

async function progressSendMessages(contactId, wsChat) {
    try {
        let messageInput = document.getElementById('message-input');
        messageInput.innerHTML = '';
        let message = messageInput.value;
        if (message) {
            let resp = await fetch(`/api/sendMessage/`, {
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
            if (resp.status === 201) {
                handlerErrorMessages(messageInput, message);
                return;
            }
            resp = await resp.json();
            sendWebSocketMessage(message, userId, contactId , wsChat);
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
    } catch (error) {
        console.error('Failed to progressSendMessages', error);
    }
}

function handlerErrorMessages(messageInput, message) {
    messageInput.value = '';
    let chatMessages = document.getElementById('chat-messages');
    var parentDiv = document.createElement('div');
    var msgDiv = document.createElement('div');

    msgDiv.className = 'message';

    parentDiv.classList.add('error-parent');
    parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';

    msgDiv.innerText = message;
    msgDiv.classList.add('error-message');

    parentDiv.appendChild(msgDiv);
    chatMessages.appendChild(parentDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}

function handlersSendMessage(contactId, wsChat) {
    let sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', async () => {
        progressSendMessages(contactId, wsChat);
    });
    let messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            progressSendMessages(contactId, wsChat);
        }
    });
}

// ============================== CHAT toggle ==============================

async function toggleChanelChat(contactId) {
    try {
        let userMsg = await APIgetMessages(contactId);
        let roomName = 'chat_';
        contactId > userId ? roomName += userId + '_' + contactId : roomName += contactId + '_' + userId;
        // console.log(roomName);
        roomName = await APIgetHashRoom(roomName);
        // console.log(roomName);
        let wsChat = await connectWebSocket(roomName.roomName);
        let contactUser = await APIgetUserById(contactId);
        innerChatChanel(contactId, contactUser);
        innerMessages(contactId, userMsg);
        handleCloseChatChanel(contactId);
        handlersRemoveBlockRelation(userMsg);
        handlersSendMessage(contactId, wsChat);
        handlersGameInvite(contactId, wsChat);
        handlersInviteResp(contactId);
    } catch (error) {
        console.error('Failed to toggleChanelChat', error);
    }
}

async function toggleChatMenu() {
    try {
        let chatUser = await APIgetChatUsers();
        innerChatPannel();
        displayChatPannel();
        handleCloseChatPannel();
        handleOpenChatPannel(chatUser);
        
        if (chatUser.length > 0) {
            innerChatUsers(chatUser);
            handlersContactClick();
        }
    } catch (error) {
        console.error('Failed to toggleChatMenu', error);
    }
}
// social.js

// ============================== SOCIAL utils ==============================

function getSocialStatus(user) {
    const statusIcons = {
        3: '<i class="fa-regular fa-paper-plane"></i>',
        2: '<i class="fa-solid fa-xmark"></i><i class="fa-solid fa-user-plus"></i>',
        1: '<i class="fa-solid fa-hourglass-start"></i>',
        0: '<i class="fa-solid fa-plus"></i>',
        '-1': '<i class="fa-solid fa-user-slash"></i>',
    };
    
    const icon = statusIcons[user.friend_status] || '';
    return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}">${icon}</a>`;
}

function getUdateStatus(friend_status) {
    if (friend_status == 0) {
        return '<i class="fa-solid fa-xmark"></i><i class="fa-solid fa-user-plus"></i>';
    } else if (friend_status == 2) {
        return '<i class="fa-regular fa-paper-plane"></i>';
    } else {
        return 'pbs';
    }
    
}

// ============================== SOCIAL update ==============================

async function updateUIStatusUserWS(friendStatus, socialUserId) {
    try {
        let userToUpdate = document.querySelector(`.add-friend[data-id="${socialUserId}"]`);
        userToUpdate.innerHTML = getUdateStatus(friendStatus);
        userToUpdate.setAttribute('data-status', friendStatus == 0 ? 2 : 3);
    } catch (error) {
        console.error('Failed to updateUIStatusUserWS', error);
    }
}

async function sendUpdateSocialStatusWS(friendStatus, wsToUser) {
    try {
        wsToUser.send(JSON.stringify({
            'updateId': friendStatus,
            'senderId': userId
        }));
    } catch (error) {
        console.error('Error in sendUpdateSocialStatusWS:', error);
    }
}

async function sendToWebSocket(friendStatus, socialUserId) {
    try {
        let userToSendRoom = await APIgetHashRoom('social_' + socialUserId);
        let wsToUser = await connectSocialWebSocket(userToSendRoom.roomName);

        wsToUser.onopen = () => {
            sendUpdateSocialStatusWS(friendStatus, wsToUser);
            setTimeout(() => {
                disconnectSocialWebSocket(wsToUser);
            }, 10000);
        };

        wsToUser.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    } catch (error) {
        console.error('Error in sendToWebSocket:', error);
    }
}

async function updateSocialStatus(event) {
    try {
        event.preventDefault();
        const link = event.target.closest('a');
        const socialUserId = link.getAttribute('data-id');
        const friendStatus = link.getAttribute('data-status');

        await APIupdateSocialStatus(socialUserId, friendStatus);
        sendToWebSocket(friendStatus, socialUserId);
        updateUserSocialUI(socialUserId, friendStatus);
    } catch (error) {
        console.error('Failed to update social status:', error);
    }
}

async function updateUserSocialUI(socialUserId, friendStatus) {
    try {
        const socialUsers = await APIgetSocialUsers();
        innerSocialUser(socialUsers);
        handleUpdateStatusUser();
    } catch (error) {
        console.error('Failed to updateUserSocialUI', error);
    }
}

// ============================== SOCIAL display ==============================


async function displaySocialPannel() {
    try {
        const socialMenu = document.getElementById('pannel');
        socialMenu.classList.add('active');
    } catch (error) {
        console.error('Failed to displaySocialMenus', error);
    }
}

// ============================== SOCIAL hide ==============================

async function hidePanel() {
    try {
        const pannel = document.getElementById('pannel');
        pannel.classList.remove('active');
        pannel.innerHTML = '';
    } catch (error) {
        console.error('Failed to hideSocialMenus', error);
    }
}

// ============================== SOCIAL inner ==============================

async function innerSocialPannel() {
    try {
        const socialMenu = document.getElementById('pannel');
        socialMenu.innerHTML = `
            <div id="social-container">
                <div id="social-panel">
                    <div id="social-header">
                        <div class="social-head-info">
                            <a href="/profil/"></a>
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
                            <div class="profile-info-item"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to innerSocialMenus', error);
    }
}

async function innerSocialUser(socialUsers) {
    try {
        const userContainer = document.querySelector('#profile-info .profile-info-item');
        userContainer.innerHTML = socialUsers.map(user => `
            <div class="user">
                <div class="data">
                    <a href="/visited_profil/${user.username}/" style="position: relative;">
                        <img class="${user.is_online ? 'online' : 'offline'}" src="${user.img.startsWith('profile_pics/') ? '/media/' + user.img : user.img}" alt="pp">
                        ${user.notif === 1 ? '<i class="fas fa-exclamation mark-notif"></i>' : ''}
                    </a>
                    <span>${user.username}</span>
                </div>
                <div class="social-action">
                    <span>
                        ${getSocialStatus(user)}
                    </span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to innerSocialUser', error);
    }
}

// ============================== SOCIAL handle ==============================

async function handleCloseSocialPannel(ws) {
    try {
        const socialCloseBtn = document.getElementById('social-close-btn');
        socialCloseBtn.addEventListener('click', async function () {
            hidePanel();
            displaySubMenus();
            disableNotifSubMenus();
            APIclearNotifSocial();
            await updateAllNotif();
            disconnectSocialWebSocket(ws);
        });
    } catch (error) {
        console.error('Failed to handleCloseSocialPannel', error);
    }
}

async function handleOpenSocialPannel() {
    try {
        const socialContainer = document.getElementById('social-container');
        socialContainer.classList.add('active');
    } catch (error) {
        console.error('Failed to handleOpenSocialPannel', error);
    }
}

async function handleUpdateStatusUser() {
    try {
        document.querySelectorAll('.add-friend').forEach(link => {
            link.addEventListener('click', updateSocialStatus);
        });
    } catch (error) {
        console.error('Failed to handleUpdateStatusUser', error);
    }
}

// ============================== SOCIAL toggle ==============================

async function toggleSocialMenu() {
    try {
        socialUsers = await APIgetSocialUsers();
        innerSocialPannel();
        displaySocialPannel();
        handleOpenSocialPannel();
        let roomName = 'social_' + userId;
        roomName = await APIgetHashRoom(roomName);
        roomName = roomName.roomName;
        ws = await connectSocialWebSocket(roomName);
        handleCloseSocialPannel(ws);
        if (socialUsers.length > 0) {
            innerSocialUser(socialUsers);
            handleUpdateStatusUser();
        }
        APIclearNotifSocial();
        await updateAllNotif();
        console.log('Social menu toggled and remove notif');
    } catch (error) {
        console.error('Failed to toggleSocialMenu', error);
    }
}


// menus.js

// ============================== MAIN ==============================

let user;
let userId;
let globalNotif;
let chatNotif;
let socialNotif;
let nbrChatNotif;
let nbrSocialNotif;

document.addEventListener('DOMContentLoaded', async function () {
    user = await APIgetCurrentUser();
    userId = user.id;
    await updateAllNotif();
    displayMenus();
    disableNotifMenus();
    document.getElementById('pre-menu-btn').addEventListener('click', toggleRadialMenu);
});

// =============================== MENU INNER ================================

async function innerSubMenus() {
    try {
        let radialMenu = document.getElementById('radial-menu');
        radialMenu.innerHTML = `
            <div id="chat-panel-btn">
                <i id="chat-btn" class="fas fa-comment-alt"></i>
                <div id="notif-chat" class="notif notif-count">
                    <span>${nbrChatNotif}</span>
                </div>
            </div>
            <div id="social-panel-btn">
                <i id="social-btn" class="fas fa-user"></i>
                <div id="notif-social" class="notif notif-count">
                    <span>${nbrSocialNotif}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to innerSubMenus', error);
    }
}

// ============================== MENU display ==============================

async function displaySubMenus() {
    try {
        let radialMenu = document.getElementById('radial-menu');
        radialMenu.classList.add('active');
    } catch (error) {
        console.error('Failed to displaySubMenus', error);
    }
}

async function displayMenus() {
    try {
        let preMenus = document.getElementById('pre-menu');
        preMenus.classList.add('active');
    } catch (error) {
        console.error('Failed to displayMenus', error);
    }
}

// =============================== MENU hide ================================


async function hideSubMenus() {
    try {
        let radialMenu = document.getElementById('radial-menu');
        radialMenu.innerHTML = '';
        radialMenu.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideSubMenus', error);
    }
}

async function hideNotifSubMenus() {
    try {
        let notifChatBox = document.getElementById('notif-chat');
        notifChatBox.classList.remove('active');
        let notifSocialBox = document.getElementById('notif-social');
        notifSocialBox.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideNotifSubMenus', error);
    }
}

// =============================== MENU toggle ================================

async function toggleRadialMenu() {
    try {        
        let radialMenu = document.getElementById('radial-menu');

        if (radialMenu.classList.contains('active')) {
            await updateAllNotif();
            hideSubMenus();
            disableNotifMenus();
        } else {
            hideNotifMenus();
            innerSubMenus();
            displaySubMenus();
            disableNotifSubMenus();
            radialMenu.addEventListener('click', async function (e) {
                if (e.target.id === 'chat-btn') {
                    toggleChatMenu();
                    hideNotifSubMenus();
                } else if (e.target.id === 'social-btn') {
                    toggleSocialMenu();
                    hideNotifSubMenus();
                }
            });
        }
    } catch (error) {
        console.error('Failed to toggleRadialMenu', error);
    }
}

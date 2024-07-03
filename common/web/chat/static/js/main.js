// main.js

document.addEventListener('DOMContentLoaded', async function () {
	// Social Panel
	document.getElementById('social-btn').addEventListener('click', function () {
		toggleSocialPanel();
	});
	document.getElementById('social-close-btn').addEventListener('click', function () {
		closeSocialPanel();
	});

	// Chat Panel
	document.getElementById('chat-btn').addEventListener('click', function () {
		toggleChatPanel();
	});
	document.getElementById('back-btn').addEventListener('click', function () {
		showContactList();
	});
	document.getElementById('close-btn').addEventListener('click', function () {
		closeChatPanel();
	});

	try {
		const currentUser = await getCurrentUser();
		if (currentUser) {
			const socialUsers = await getSocialUsers(currentUser.id);
			displaySocialUsers(socialUsers);
			const currentUserId = currentUser.id;
			await loadChatUsers(currentUserId);
		}
	} catch (error) {
		console.error('Failed to initialize panels:', error);
	}
});

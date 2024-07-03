// api.js

async function getCurrentUserId() {
	try {
		let response = await fetch('http://localhost:8000/api/@me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		let me = await response.json();
		return me.id;
	} catch (error) {
		console.error('Failed to get current user ID', error);
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

async function getMessages(contactId) {
	try {
		let response = await fetch(`http://localhost:8000/api/getMessages/${contactId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		return await response.json();
	} catch (error) {
		console.error('Failed to get messages', error);
		throw error;
	}
}

async function sendMessage(contactId, message) {
	try {
		let response = await fetch(`http://localhost:8000/api/sendMessage/${contactId}/?message=${encodeURIComponent(message)}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to send message', error);
		throw error;
	}
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

async function getSocialUsers(userId) {
	try {
		let response = await fetch(`http://localhost:8000/api/getSocialUser?id=${userId}`, {
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

async function addFriend(friendId) {
	try {
		let response = await fetch(`http://localhost:8000/api/addFriend/${friendId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Error adding friend:', error);
		throw error;
	}
}
// chat.js

async function loadChatUsers(currentUserId) {
    try {
        let chatUsers = await getChatUsers();
        displayChatUsers(chatUsers);

        document.querySelectorAll('.contact').forEach(contact => {
            contact.addEventListener('click', function () {
                var contactId = this.getAttribute('data-contact-id');
                var contactName = this.querySelector('.contact-name').textContent;
                var contactImg = this.getAttribute('data-contact-img');
                openChatWith(contactId, contactName, contactImg, currentUserId);
            });
        });
    } catch (error) {
        console.error('Failed to load chat users', error);
    }
}

async function openChatWith(contactId, contactName, contactImg, currentUserId) {
    openChatUI(contactId, contactName, contactImg);

    try {
        let messages = await getMessages(contactId);
        messages.forEach(msg => {
            appendMessage(msg, msg.sender === currentUserId);
        });

        var sendBtn = document.getElementById('send-btn');
        sendBtn.addEventListener('click', async function () {
            var messageInput = document.getElementById('message-input');
            var newMessage = messageInput.value.trim();
            if (newMessage !== '') {
                appendMessage({ content: newMessage }, true);
                messageInput.value = '';
                try {
                    await sendMessage(contactId, newMessage);
                } catch (error) {
                    showErrorMessage('Failed to send message');
                }
            }
        });
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const imageBtn = document.getElementById('imageBtn');
    const imageInput = document.getElementById('imageInput');
    const brandingCenter = document.getElementById('brandingCenter');
    const brandingCorner = document.getElementById('brandingCorner');

    let currentImageData = null;

    function toggleBranding(hasMessages) {
        if (hasMessages) {
            brandingCenter.classList.add('hidden');
            brandingCorner.classList.remove('hidden');
        } else {
            brandingCenter.classList.remove('hidden');
            brandingCorner.classList.add('hidden');
        }
    }

    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Add event listener for Enter key submission
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter without Shift
            event.preventDefault(); // Prevents new line on Enter
            sendBtn.click(); // Triggers the send button click
        }
    });

    function displayMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        toggleBranding(true);
    }

    async function sendUserInput(message, imageFile) {
        const formData = new FormData();
        if (message) formData.append('message', message);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch('/process-input/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    displayMessage(data.response, 'bot');
                } else {
                    displayMessage('Error: ' + data.error, 'bot');
                }
            } else {
                displayMessage('Error: Server response failed', 'bot');
            }
        } catch (error) {
            console.error('Request failed:', error);
            displayMessage('Error: Request failed', 'bot');
        }
    }

    sendBtn.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message || currentImageData) {
            const imageFile = currentImageData ? imageInput.files[0] : null;
            sendUserInput(message, imageFile);
            displayMessage(message, 'user');
            userInput.value = '';
            currentImageData = null;
        }
    });

    imageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', () => {
        currentImageData = imageInput.files[0];
    });
});

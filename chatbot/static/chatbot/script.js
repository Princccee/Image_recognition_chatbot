document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const imageBtn = document.getElementById('imageBtn');
    const imageInput = document.getElementById('imageInput');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const languageSelect = document.getElementById('languageSelect');
    const brandingCenter = document.getElementById('brandingCenter');
    const brandingCorner = document.getElementById('brandingCorner');
3
    let currentImageData = null;

    // Function to toggle branding position
    function toggleBranding(hasMessages) {
        if (hasMessages) {
            brandingCenter.classList.add('hidden');
            brandingCorner.classList.remove('hidden');
        } else {
            brandingCenter.classList.remove('hidden');
            brandingCorner.classList.add('hidden');
        }
    }

    // Initialize speech recognition
    let recognition = null;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Create image preview container
    const imagePreviewContainer = document.createElement('div');
    imagePreviewContainer.className = 'image-preview-container';
    imagePreviewContainer.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 0;
        padding: 10px;
        background-color: #40414f;
        border-radius: 5px;
        margin-bottom: 10px;
        display: none;
    `;
    document.querySelector('.input-container').appendChild(imagePreviewContainer);

    // Add remove image button
    const removeImageBtn = document.createElement('button');
    removeImageBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeImageBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        color: white;
        border-radius: 50%;
        padding: 5px;
        cursor: pointer;
    `;
    removeImageBtn.onclick = clearImagePreview;
    imagePreviewContainer.appendChild(removeImageBtn);

    // Function to clear the image preview
    function clearImagePreview() {
        currentImageData = null;
        imagePreviewContainer.style.display = 'none';
        imageInput.value = '';
    }

    // Function to display a message in the chat
    function displayMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        toggleBranding(true);
    }

    // Function to send user input to the backend
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

    // Event listener for the Send button
    sendBtn.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message || currentImageData) {
            const imageFile = currentImageData ? imageInput.files[0] : null;
            sendUserInput(message, imageFile);
            displayMessage(message, 'user'); // Display user's message
            userInput.value = ''; // Clear input field
            currentImageData = null; // Reset image data if applicable
        }
    });

    // Event listener for the image button
    imageBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // Event listener for image input change
    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) {
            currentImageData = imageInput.files[0];
            imagePreviewContainer.style.display = 'block';
            imagePreviewContainer.textContent = `Selected Image: ${currentImageData.name}`;
            imagePreviewContainer.appendChild(removeImageBtn);
        }
    });

    // Initialize chat interface with no messages
    toggleBranding(false);
});


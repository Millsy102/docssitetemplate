const { BeamAuth } = require('../../middleware/BeamAuth');
const { BeamFileService } = require('../../services/BeamFileService');
const path = require('path');
const fs = require('fs-extra');

class RealTimeChatWidget {
    constructor() {
        this.name = 'RealTimeChat';
        this.description = 'Modern real-time chat with file sharing and collaboration';
        this.version = '1.0.0';
        this.author = 'BeamFlow System';
    }

    getHTML(data = {}) {
        const { currentUser, messages = [], onlineUsers = [], files = [] } = data;
        
        return `
        <div class="chat-widget" id="chatWidget">
            <!-- Chat Header -->
            <div class="chat-header">
                <div class="chat-header-left">
                    <div class="chat-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <div class="chat-info">
                        <h3>Team Chat</h3>
                        <span class="online-status">
                            <span class="status-dot"></span>
                            ${onlineUsers.length} online
                        </span>
                    </div>
                </div>
                <div class="chat-header-right">
                    <button class="chat-btn" onclick="toggleChatSettings()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Chat Body -->
            <div class="chat-body" id="chatBody">
                <div class="chat-messages" id="chatMessages">
                    ${this.renderMessages(messages)}
                </div>
                
                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typingIndicator" style="display: none;">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">Someone is typing...</span>
                </div>
            </div>

            <!-- Chat Input -->
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <button class="attachment-btn" onclick="toggleFileUpload()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                        </svg>
                    </button>
                    
                    <div class="chat-input" contenteditable="true" id="chatInput" 
                         placeholder="Type a message..." 
                         onkeydown="handleChatKeydown(event)"
                         oninput="handleChatInput()"></div>
                    
                    <button class="send-btn" onclick="sendMessage()" id="sendBtn" disabled>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                
                <!-- File Upload Area -->
                <div class="file-upload-area" id="fileUploadArea" style="display: none;">
                    <div class="file-upload-content">
                        <div class="file-upload-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                        </div>
                        <p>Drop files here or click to upload</p>
                        <input type="file" id="fileInput" multiple onchange="handleFileSelect(event)" style="display: none;">
                        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
                            Choose Files
                        </button>
                    </div>
                </div>
            </div>

            <!-- Online Users Sidebar -->
            <div class="online-users-sidebar" id="onlineUsersSidebar">
                <div class="sidebar-header">
                    <h4>Online Users</h4>
                    <button class="close-sidebar" onclick="toggleOnlineUsers()">×</button>
                </div>
                <div class="online-users-list" id="onlineUsersList">
                    ${this.renderOnlineUsers(onlineUsers)}
                </div>
            </div>

            <!-- Chat Settings Modal -->
            <div class="chat-settings-modal" id="chatSettingsModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Chat Settings</h3>
                        <button class="close-modal" onclick="closeChatSettings()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-group">
                            <label>Notifications</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="notificationsToggle" checked>
                                <span class="slider"></span>
                            </div>
                        </div>
                        <div class="setting-group">
                            <label>Sound Alerts</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="soundToggle" checked>
                                <span class="slider"></span>
                            </div>
                        </div>
                        <div class="setting-group">
                            <label>Theme</label>
                            <select id="chatTheme">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let chatSocket = null;
            let typingTimeout = null;
            let currentUser = ${JSON.stringify(currentUser || {})};
            let isTyping = false;

            // Initialize WebSocket connection
            function initializeChatSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = \`\${protocol}//\${window.location.host}/ws/chat\`;
                
                chatSocket = new WebSocket(wsUrl);
                
                chatSocket.onopen = function() {
                    console.log('Chat WebSocket connected');
                    sendChatEvent('join', { user: currentUser });
                };
                
                chatSocket.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    handleChatMessage(data);
                };
                
                chatSocket.onclose = function() {
                    console.log('Chat WebSocket disconnected');
                    setTimeout(initializeChatSocket, 3000); // Reconnect after 3 seconds
                };
            }

            // Handle incoming chat messages
            function handleChatMessage(data) {
                switch(data.type) {
                    case 'message':
                        addMessageToChat(data.message);
                        break;
                    case 'typing':
                        showTypingIndicator(data.user);
                        break;
                    case 'stopTyping':
                        hideTypingIndicator(data.user);
                        break;
                    case 'userJoined':
                        addUserJoinedMessage(data.user);
                        break;
                    case 'userLeft':
                        addUserLeftMessage(data.user);
                        break;
                    case 'onlineUsers':
                        updateOnlineUsers(data.users);
                        break;
                }
            }

            // Send message
            function sendMessage() {
                const input = document.getElementById('chatInput');
                const message = input.textContent.trim();
                
                if (!message) return;
                
                const messageData = {
                    type: 'message',
                    content: message,
                    user: currentUser,
                    timestamp: new Date().toISOString()
                };
                
                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify(messageData));
                }
                
                input.textContent = '';
                updateSendButton();
                sendChatEvent('stopTyping');
            }

            // Handle chat input
            function handleChatInput() {
                updateSendButton();
                
                if (!isTyping) {
                    isTyping = true;
                    sendChatEvent('typing');
                }
                
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    isTyping = false;
                    sendChatEvent('stopTyping');
                }, 1000);
            }

            // Handle chat keydown
            function handleChatKeydown(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            }

            // Update send button state
            function updateSendButton() {
                const input = document.getElementById('chatInput');
                const sendBtn = document.getElementById('sendBtn');
                sendBtn.disabled = !input.textContent.trim();
            }

            // Add message to chat
            function addMessageToChat(message) {
                const messagesContainer = document.getElementById('chatMessages');
                const messageElement = document.createElement('div');
                messageElement.className = \`chat-message \${message.user.id === currentUser.id ? 'own-message' : ''}\`;
                
                const time = new Date(message.timestamp).toLocaleTimeString();
                
                messageElement.innerHTML = \`
                    <div class="message-avatar">
                        <img src="\${message.user.avatar || '/assets/images/default-avatar.png'}" alt="\${message.user.name}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">\${message.user.name}</span>
                            <span class="message-time">\${time}</span>
                        </div>
                        <div class="message-text">\${escapeHtml(message.content)}</div>
                    </div>
                \`;
                
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Play notification sound if enabled
                if (document.getElementById('soundToggle').checked) {
                    playNotificationSound();
                }
            }

            // Show typing indicator
            function showTypingIndicator(user) {
                const indicator = document.getElementById('typingIndicator');
                const text = indicator.querySelector('.typing-text');
                text.textContent = \`\${user.name} is typing...\`;
                indicator.style.display = 'flex';
            }

            // Hide typing indicator
            function hideTypingIndicator(user) {
                const indicator = document.getElementById('typingIndicator');
                indicator.style.display = 'none';
            }

            // Send chat event
            function sendChatEvent(eventType, data = {}) {
                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify({
                        type: eventType,
                        user: currentUser,
                        ...data
                    }));
                }
            }

            // Toggle file upload
            function toggleFileUpload() {
                const uploadArea = document.getElementById('fileUploadArea');
                uploadArea.style.display = uploadArea.style.display === 'none' ? 'block' : 'none';
            }

            // Handle file selection
            function handleFileSelect(event) {
                const files = event.target.files;
                for (let file of files) {
                    uploadFile(file);
                }
            }

            // Upload file
            function uploadFile(file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('user', JSON.stringify(currentUser));
                
                fetch('/admin/api/chat/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        sendFileMessage(data.file);
                    }
                })
                .catch(error => {
                    console.error('File upload error:', error);
                });
            }

            // Send file message
            function sendFileMessage(file) {
                const messageData = {
                    type: 'file',
                    file: file,
                    user: currentUser,
                    timestamp: new Date().toISOString()
                };
                
                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify(messageData));
                }
            }

            // Toggle online users sidebar
            function toggleOnlineUsers() {
                const sidebar = document.getElementById('onlineUsersSidebar');
                sidebar.classList.toggle('open');
            }

            // Toggle chat settings
            function toggleChatSettings() {
                const modal = document.getElementById('chatSettingsModal');
                modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
            }

            // Close chat settings
            function closeChatSettings() {
                document.getElementById('chatSettingsModal').style.display = 'none';
            }

            // Play notification sound
            function playNotificationSound() {
                const audio = new Audio('/assets/sounds/notification.mp3');
                audio.play().catch(e => console.log('Could not play notification sound'));
            }

            // Escape HTML
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // Initialize chat when page loads
            document.addEventListener('DOMContentLoaded', function() {
                initializeChatSocket();
                
                // Set up drag and drop for files
                const chatBody = document.getElementById('chatBody');
                const uploadArea = document.getElementById('fileUploadArea');
                
                chatBody.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    uploadArea.style.display = 'block';
                });
                
                chatBody.addEventListener('dragleave', function(e) {
                    if (!chatBody.contains(e.relatedTarget)) {
                        uploadArea.style.display = 'none';
                    }
                });
                
                uploadArea.addEventListener('drop', function(e) {
                    e.preventDefault();
                    uploadArea.style.display = 'none';
                    
                    const files = e.dataTransfer.files;
                    for (let file of files) {
                        uploadFile(file);
                    }
                });
            });
        </script>
        `;
    }

    renderMessages(messages) {
        if (!messages.length) {
            return `
                <div class="empty-chat">
                    <div class="empty-chat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <h3>Welcome to Team Chat!</h3>
                    <p>Start a conversation with your team members</p>
                </div>
            `;
        }

        return messages.map(message => {
            const time = new Date(message.timestamp).toLocaleTimeString();
            const isOwn = message.user.id === 'current-user-id'; // This would be dynamic
            
            return `
                <div class="chat-message ${isOwn ? 'own-message' : ''}">
                    <div class="message-avatar">
                        <img src="${message.user.avatar || '/assets/images/default-avatar.png'}" alt="${message.user.name}">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author">${message.user.name}</span>
                            <span class="message-time">${time}</span>
                        </div>
                        <div class="message-text">${message.content}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderOnlineUsers(users) {
        if (!users.length) {
            return '<div class="no-online-users">No users online</div>';
        }

        return users.map(user => `
            <div class="online-user">
                <div class="user-avatar">
                    <img src="${user.avatar || '/assets/images/default-avatar.png'}" alt="${user.name}">
                    <span class="status-indicator online"></span>
                </div>
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-status">${user.status || 'Online'}</span>
                </div>
            </div>
        `).join('');
    }

    getCSS() {
        return `
        .chat-widget {
            display: flex;
            flex-direction: column;
            height: 600px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .chat-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .chat-avatar svg {
            width: 20px;
            height: 20px;
        }

        .chat-info h3 {
            margin: 0;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }

        .online-status {
            display: flex;
            align-items: center;
            gap: 6px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .chat-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chat-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .chat-btn svg {
            width: 18px;
            height: 18px;
        }

        .chat-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }

        .chat-message {
            display: flex;
            gap: 12px;
            max-width: 80%;
            animation: messageSlideIn 0.3s ease;
        }

        .chat-message.own-message {
            align-self: flex-end;
            flex-direction: row-reverse;
        }

        @keyframes messageSlideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
        }

        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .message-content {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .own-message .message-content {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .message-author {
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        .message-time {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
        }

        .message-text {
            color: white;
            font-size: 14px;
            line-height: 1.4;
        }

        .empty-chat {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
        }

        .empty-chat-icon {
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }

        .empty-chat-icon svg {
            width: 32px;
            height: 32px;
            color: rgba(255, 255, 255, 0.6);
        }

        .empty-chat h3 {
            margin: 0 0 8px 0;
            color: white;
            font-size: 20px;
            font-weight: 600;
        }

        .empty-chat p {
            margin: 0;
            font-size: 14px;
        }

        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dots span {
            width: 6px;
            height: 6px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: typingDot 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typingDot {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .chat-input-container {
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-input-wrapper {
            display: flex;
            align-items: flex-end;
            gap: 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .attachment-btn, .send-btn {
            background: none;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .attachment-btn:hover, .send-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .attachment-btn svg, .send-btn svg {
            width: 18px;
            height: 18px;
        }

        .chat-input {
            flex: 1;
            min-height: 20px;
            max-height: 100px;
            padding: 8px 12px;
            background: none;
            border: none;
            color: white;
            font-size: 14px;
            line-height: 1.4;
            outline: none;
            resize: none;
            overflow-y: auto;
        }

        .chat-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .file-upload-area {
            margin-top: 12px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s ease;
        }

        .file-upload-area:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.05);
        }

        .file-upload-content {
            color: rgba(255, 255, 255, 0.8);
        }

        .file-upload-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .file-upload-icon svg {
            width: 24px;
            height: 24px;
            color: rgba(255, 255, 255, 0.6);
        }

        .upload-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 8px 16px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 12px;
        }

        .upload-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        .online-users-sidebar {
            position: absolute;
            top: 0;
            right: -300px;
            width: 300px;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            transition: right 0.3s ease;
            z-index: 1000;
        }

        .online-users-sidebar.open {
            right: 0;
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h4 {
            margin: 0;
            color: white;
            font-size: 16px;
            font-weight: 600;
        }

        .close-sidebar {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-sidebar:hover {
            color: white;
        }

        .online-users-list {
            padding: 20px;
            overflow-y: auto;
        }

        .online-user {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            transition: background 0.2s ease;
        }

        .online-user:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
        }

        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .status-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid rgba(0, 0, 0, 0.9);
        }

        .status-indicator.online {
            background: #4ade80;
        }

        .user-info {
            flex: 1;
        }

        .user-name {
            display: block;
            color: white;
            font-weight: 500;
            font-size: 14px;
        }

        .user-status {
            display: block;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            margin-top: 2px;
        }

        .no-online-users {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            padding: 20px;
        }

        .chat-settings-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
        }

        .close-modal {
            background: none;
            border: none;
            color: #6b7280;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-modal:hover {
            color: #374151;
        }

        .modal-body {
            padding: 20px;
        }

        .setting-group {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .setting-group:last-child {
            border-bottom: none;
        }

        .setting-group label {
            color: #374151;
            font-weight: 500;
            font-size: 14px;
        }

        .toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #d1d5db;
            transition: 0.3s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #3b82f6;
        }

        input:checked + .slider:before {
            transform: translateX(20px);
        }

        #chatTheme {
            background: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 14px;
            color: #374151;
        }

        @media (max-width: 768px) {
            .chat-widget {
                height: 100vh;
                border-radius: 0;
            }
            
            .chat-message {
                max-width: 90%;
            }
            
            .online-users-sidebar {
                width: 100%;
                right: -100%;
            }
        }
        `;
    }
}

module.exports = RealTimeChatWidget;

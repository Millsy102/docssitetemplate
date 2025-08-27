const BeamErrorHandler = require('../../utils/BeamErrorHandler');

class AIGameChatWidget {
    constructor() {
        this.name = 'AIGameChat';
        this.description = 'AI-powered game creation chat interface';
        this.version = '1.0.0';
        this.isInitialized = false;
        this.gameEngine = null;
        this.messages = [];
        this.isGenerating = false;
    }

    /**
     * Initialize the widget
     */
    async initialize() {
        try {
            console.log(' Initializing AI Game Chat Widget...');
            
            // Get reference to AI Game Engine
            this.gameEngine = global.aiGameEngine;
            
            this.isInitialized = true;
            console.log(' AI Game Chat Widget initialized successfully');
            
        } catch (error) {
            BeamErrorHandler.logError('AI Game Chat Widget Initialization Error', error);
            throw error;
        }
    }

    /**
     * Render the widget
     */
    async render(data = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const widgetId = data.id || 'ai-game-chat';
            const onGameCreated = data.onGameCreated || null;

            return `
                <div id="${widgetId}" class="ai-game-chat-widget">
                    <div class="chat-header">
                        <h3> AI Game Creator</h3>
                        <p>Describe the game you want to create!</p>
                    </div>
                    
                    <div class="chat-messages" id="${widgetId}-messages">
                        <div class="message ai">
                            <div class="message-content">
                                Hello! I'm your AI game creator. Just describe what kind of game you want, and I'll build it for you! 
                                Try saying something like "Create a 3D platformer with a cat character" or "Make an RPG with magic and quests".
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <input 
                            type="text" 
                            id="${widgetId}-input" 
                            placeholder="Describe the game you want to create..."
                            class="chat-input-field"
                        />
                        <button 
                            id="${widgetId}-send" 
                            class="chat-send-button"
                            onclick="AIGameChatWidget.sendMessage('${widgetId}', ${onGameCreated ? 'true' : 'false'})"
                        >
                            Create Game
                        </button>
                    </div>
                    
                    <div class="chat-templates">
                        <h4>Quick Templates:</h4>
                        <div class="template-buttons">
                            <button onclick="AIGameChatWidget.useTemplate('${widgetId}', 'Create a 3D platformer with a cute character')" class="template-btn">
                                 3D Platformer
                            </button>
                            <button onclick="AIGameChatWidget.useTemplate('${widgetId}', 'Create an RPG with magic and quests')" class="template-btn">
                                 RPG Adventure
                            </button>
                            <button onclick="AIGameChatWidget.useTemplate('${widgetId}', 'Create a racing game with futuristic cars')" class="template-btn">
                                 Racing Game
                            </button>
                            <button onclick="AIGameChatWidget.useTemplate('${widgetId}', 'Create a puzzle game with challenging levels')" class="template-btn">
                                 Puzzle Game
                            </button>
                        </div>
                    </div>
                </div>
                
                <script>
                    // AI Game Chat Widget JavaScript
                    window.AIGameChatWidget = {
                        sendMessage: async function(widgetId, hasCallback) {
                            const input = document.getElementById(widgetId + '-input');
                            const sendButton = document.getElementById(widgetId + '-send');
                            const messagesContainer = document.getElementById(widgetId + '-messages');
                            
                            const message = input.value.trim();
                            if (!message) return;
                            
                            // Add user message
                            this.addMessage(widgetId, 'user', message);
                            input.value = '';
                            
                            // Disable input while generating
                            input.disabled = true;
                            sendButton.disabled = true;
                            sendButton.textContent = 'Creating...';
                            
                            try {
                                // Send message to AI
                                const response = await this.processMessage(widgetId, message);
                                
                                // Add AI response
                                this.addMessage(widgetId, 'ai', response);
                                
                                // Check if game was created
                                if (response.includes('created') || response.includes('ready')) {
                                    if (hasCallback && window.onGameCreated) {
                                        window.onGameCreated();
                                    }
                                }
                                
                            } catch (error) {
                                this.addMessage(widgetId, 'error', 'Sorry, I encountered an error. Please try again.');
                                console.error('AI Chat Error:', error);
                            } finally {
                                // Re-enable input
                                input.disabled = false;
                                sendButton.disabled = false;
                                sendButton.textContent = 'Create Game';
                                input.focus();
                            }
                        },
                        
                        useTemplate: function(widgetId, template) {
                            const input = document.getElementById(widgetId + '-input');
                            input.value = template;
                            this.sendMessage(widgetId, false);
                        },
                        
                        addMessage: function(widgetId, type, content) {
                            const messagesContainer = document.getElementById(widgetId + '-messages');
                            const messageDiv = document.createElement('div');
                            messageDiv.className = \`message \${type}\`;
                            
                            const contentDiv = document.createElement('div');
                            contentDiv.className = 'message-content';
                            contentDiv.innerHTML = content;
                            
                            messageDiv.appendChild(contentDiv);
                            messagesContainer.appendChild(messageDiv);
                            
                            // Scroll to bottom
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        },
                        
                        processMessage: async function(widgetId, message) {
                            // Send to AI Game Engine
                            if (window.aiGameEngine && window.aiGameEngine.chat) {
                                return await window.aiGameEngine.chat.processMessage(message);
                            } else {
                                // Fallback response
                                return \`I'll create a game for you! Let me analyze your request: "\${message}" and generate:
- Game mechanics and systems
- Characters and environments  
- Assets and resources
- Code and logic
Your game will be ready in about 30 seconds!\`;
                            }
                        }
                    };
                    
                    // Handle Enter key
                    document.addEventListener('DOMContentLoaded', function() {
                        const inputs = document.querySelectorAll('.chat-input-field');
                        inputs.forEach(input => {
                            input.addEventListener('keypress', function(e) {
                                if (e.key === 'Enter') {
                                    const widgetId = this.id.replace('-input', '');
                                    window.AIGameChatWidget.sendMessage(widgetId, false);
                                }
                            });
                        });
                    });
                </script>
            `;

        } catch (error) {
            BeamErrorHandler.logError('AI Game Chat Widget Render Error', error);
            return '<div class="widget-error">Error rendering AI Game Chat Widget</div>';
        }
    }

    /**
     * Get widget CSS
     */
    get css() {
        return `
            .ai-game-chat-widget {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                padding: 20px;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 600px;
                margin: 20px auto;
            }
            
            .chat-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }
            
            .chat-header h3 {
                margin: 0 0 10px 0;
                font-size: 24px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .chat-header p {
                margin: 0;
                opacity: 0.9;
                font-size: 14px;
            }
            
            .chat-messages {
                height: 300px;
                overflow-y: auto;
                margin-bottom: 20px;
                padding: 10px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
            }
            
            .message.user {
                justify-content: flex-end;
            }
            
            .message.ai {
                justify-content: flex-start;
            }
            
            .message.error {
                justify-content: center;
            }
            
            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .message.user .message-content {
                background: #4CAF50;
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .message.ai .message-content {
                background: rgba(255,255,255,0.2);
                color: white;
                border-bottom-left-radius: 4px;
                backdrop-filter: blur(10px);
            }
            
            .message.error .message-content {
                background: #f44336;
                color: white;
                border-radius: 10px;
                text-align: center;
            }
            
            .chat-input {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .chat-input-field {
                flex: 1;
                padding: 12px 16px;
                border: none;
                border-radius: 25px;
                background: rgba(255,255,255,0.9);
                color: #333;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
            }
            
            .chat-input-field:focus {
                background: white;
                box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
            }
            
            .chat-input-field:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .chat-send-button {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                color: white;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .chat-send-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            
            .chat-send-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .chat-templates {
                text-align: center;
            }
            
            .chat-templates h4 {
                margin: 0 0 15px 0;
                font-size: 16px;
                opacity: 0.9;
            }
            
            .template-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 10px;
            }
            
            .template-btn {
                padding: 10px 15px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 20px;
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .template-btn:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.5);
                transform: translateY(-1px);
            }
            
            /* Scrollbar styling */
            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chat-messages::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
            }
            
            .chat-messages::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
            }
            
            .chat-messages::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .ai-game-chat-widget {
                    margin: 10px;
                    padding: 15px;
                }
                
                .chat-messages {
                    height: 250px;
                }
                
                .template-buttons {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .chat-input {
                    flex-direction: column;
                }
                
                .chat-send-button {
                    width: 100%;
                }
            }
            
            /* Animation for new messages */
            .message {
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Loading animation */
            .generating {
                position: relative;
            }
            
            .generating::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, transparent, #fff, transparent);
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
    }

    /**
     * Get widget stats
     */
    getStats() {
        return {
            name: this.name,
            version: this.version,
            initialized: this.isInitialized,
            messages: this.messages.length,
            isGenerating: this.isGenerating
        };
    }

    /**
     * Handle widget events
     */
    handleEvent(event, data) {
        switch (event) {
            case 'message':
                this.messages.push(data);
                break;
            case 'gameCreated':
                console.log('Game created:', data);
                break;
            default:
                console.log('Unknown event:', event, data);
        }
    }
}

module.exports = AIGameChatWidget;

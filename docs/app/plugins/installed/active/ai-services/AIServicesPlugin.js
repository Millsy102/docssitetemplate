const { PluginTemplate } = require('../../templates/PluginTemplate');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { HfInference } = require('@huggingface/inference');
const { generate } = require('stability-client');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class AIServicesPlugin extends PluginTemplate {
    constructor() {
        super('ai-services');
        this.openai = null;
        this.anthropic = null;
        this.huggingface = null;
        this.stability = null;
        this.usageStats = {
            totalRequests: 0,
            openaiRequests: 0,
            anthropicRequests: 0,
            huggingfaceRequests: 0,
            stabilityRequests: 0,
            lastReset: new Date()
        };
    }

    async initialize() {
        await super.initialize();
        
        // Initialize AI providers based on available API keys
        await this.initializeProviders();
        
        // Register hooks
        this.registerHooks();
        
        console.log(' AI Services Plugin initialized');
    }

    async initializeProviders() {
        const settings = await this.getSettings();
        
        // Initialize OpenAI
        if (settings.openai_api_key) {
            this.openai = new OpenAI({
                apiKey: settings.openai_api_key
            });
            console.log(' OpenAI initialized');
        }
        
        // Initialize Anthropic
        if (settings.anthropic_api_key) {
            this.anthropic = new Anthropic({
                apiKey: settings.anthropic_api_key
            });
            console.log(' Anthropic Claude initialized');
        }
        
        // Initialize Hugging Face
        if (settings.huggingface_api_key) {
            this.huggingface = new HfInference(settings.huggingface_api_key);
            console.log(' Hugging Face initialized');
        }
        
        // Initialize Stability AI
        if (settings.stability_api_key) {
            this.stability = {
                apiKey: settings.stability_api_key
            };
            console.log(' Stability AI initialized');
        }
    }

    registerHooks() {
        // Content creation hook
        this.registerHook('onContentCreate', async (content, context) => {
            if (context.aiAssisted) {
                return await this.generateContent({
                    type: 'content',
                    prompt: content.prompt,
                    context: content.context
                });
            }
            return content;
        });

        // Code review hook
        this.registerHook('onCodeReview', async (code, context) => {
            return await this.reviewCode(code, context);
        });
    }

    // API Handlers
    async chat(req, res) {
        try {
            const { message, model, context, temperature } = req.body;
            const settings = await this.getSettings();
            
            const response = await this.processChat(message, {
                model: model || settings.default_model,
                context,
                temperature: temperature || settings.temperature
            });
            
            this.updateUsageStats('chat');
            
            res.json({
                success: true,
                response: response.text,
                model: response.model,
                usage: response.usage
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async generateImage(req, res) {
        try {
            const { prompt, size, style, model } = req.body;
            const settings = await this.getSettings();
            
            if (!settings.enable_image_generation) {
                throw new Error('Image generation is disabled');
            }
            
            const imageData = await this.createImage(prompt, {
                size: size || '1024x1024',
                style,
                model: model || 'dall-e-3'
            });
            
            this.updateUsageStats('image');
            
            res.json({
                success: true,
                imageUrl: imageData.url,
                model: imageData.model
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async generateContent(req, res) {
        try {
            const { type, prompt, context, length } = req.body;
            const settings = await this.getSettings();
            
            if (!settings.enable_content_generation) {
                throw new Error('Content generation is disabled');
            }
            
            const content = await this.generateContent({
                type,
                prompt,
                context,
                length: length || 'medium'
            });
            
            this.updateUsageStats('content');
            
            res.json({
                success: true,
                content: content.text,
                model: content.model
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async codeReview(req, res) {
        try {
            const { code, language, focus } = req.body;
            const settings = await this.getSettings();
            
            if (!settings.enable_code_assistance) {
                throw new Error('Code assistance is disabled');
            }
            
            const review = await this.reviewCode(code, {
                language,
                focus: focus || 'general'
            });
            
            this.updateUsageStats('code');
            
            res.json({
                success: true,
                review: review.suggestions,
                score: review.score,
                model: review.model
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getAvailableModels(req, res) {
        try {
            const models = {
                openai: this.openai ? ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'] : [],
                anthropic: this.anthropic ? ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] : [],
                huggingface: this.huggingface ? ['text-generation', 'text-classification', 'translation'] : [],
                stability: this.stability ? ['stable-diffusion-xl', 'stable-diffusion-v1-6'] : []
            };
            
            res.json({
                success: true,
                models
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getUsageStats(req, res) {
        try {
            res.json({
                success: true,
                stats: this.usageStats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Core AI Methods
    async processChat(message, options = {}) {
        const { model, context, temperature } = options;
        
        if (model.startsWith('gpt') && this.openai) {
            return await this.openaiChat(message, { model, context, temperature });
        } else if (model.startsWith('claude') && this.anthropic) {
            return await this.anthropicChat(message, { model, context, temperature });
        } else if (this.huggingface) {
            return await this.huggingfaceChat(message, { context, temperature });
        }
        
        throw new Error('No available AI provider for the requested model');
    }

    async openaiChat(message, options) {
        const { model, context, temperature } = options;
        
        const response = await this.openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: context || 'You are a helpful AI assistant.' },
                { role: 'user', content: message }
            ],
            temperature: temperature,
            max_tokens: 2000
        });
        
        return {
            text: response.choices[0].message.content,
            model: model,
            usage: response.usage
        };
    }

    async anthropicChat(message, options) {
        const { model, context, temperature } = options;
        
        const response = await this.anthropic.messages.create({
            model: model,
            max_tokens: 2000,
            temperature: temperature,
            system: context || 'You are a helpful AI assistant.',
            messages: [
                { role: 'user', content: message }
            ]
        });
        
        return {
            text: response.content[0].text,
            model: model,
            usage: response.usage
        };
    }

    async huggingfaceChat(message, options) {
        const { context, temperature } = options;
        
        const response = await this.huggingface.textGeneration({
            model: 'gpt2',
            inputs: `${context || ''}\nUser: ${message}\nAssistant:`,
            parameters: {
                max_new_tokens: 200,
                temperature: temperature,
                do_sample: true
            }
        });
        
        return {
            text: response.generated_text,
            model: 'huggingface-gpt2',
            usage: { total_tokens: response.generated_text.length }
        };
    }

    async createImage(prompt, options = {}) {
        const { size, style, model } = options;
        
        if (model.startsWith('dall-e') && this.openai) {
            return await this.openaiImageGeneration(prompt, { size, style });
        } else if (model.startsWith('stable') && this.stability) {
            return await this.stabilityImageGeneration(prompt, { size, style });
        }
        
        throw new Error('No available image generation provider');
    }

    async openaiImageGeneration(prompt, options) {
        const { size, style } = options;
        
        const response = await this.openai.images.generate({
            model: 'dall-e-3',
            prompt: `${prompt}${style ? `, ${style}` : ''}`,
            size: size,
            quality: 'standard',
            n: 1
        });
        
        return {
            url: response.data[0].url,
            model: 'dall-e-3'
        };
    }

    async stabilityImageGeneration(prompt, options) {
        const { size, style } = options;
        
        const response = await generate({
            prompt: `${prompt}${style ? `, ${style}` : ''}`,
            apiKey: this.stability.apiKey,
            width: parseInt(size.split('x')[0]),
            height: parseInt(size.split('x')[1])
        });
        
        // Save image to local storage
        const imagePath = path.join(this.pluginPath, 'generated', `stability-${Date.now()}.png`);
        await fs.ensureDir(path.dirname(imagePath));
        await fs.writeFile(imagePath, response.images[0].buffer);
        
        return {
            url: `/plugins/ai-services/generated/${path.basename(imagePath)}`,
            model: 'stable-diffusion-xl'
        };
    }

    async generateContent(options) {
        const { type, prompt, context, length } = options;
        
        const contentPrompts = {
            blog: `Write a ${length} blog post about: ${prompt}`,
            article: `Write a ${length} article about: ${prompt}`,
            social: `Create a ${length} social media post about: ${prompt}`,
            email: `Write a ${length} email about: ${prompt}`
        };
        
        const message = contentPrompts[type] || prompt;
        
        return await this.processChat(message, { context });
    }

    async reviewCode(code, options) {
        const { language, focus } = options;
        
        const reviewPrompt = `Review this ${language} code with focus on ${focus}:
        
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Code quality score (1-10)
2. Specific suggestions for improvement
3. Security considerations
4. Performance optimizations`;

        const response = await this.processChat(reviewPrompt);
        
        // Parse the response to extract structured feedback
        const suggestions = this.parseCodeReview(response.text);
        
        return {
            suggestions,
            score: suggestions.score || 7,
            model: response.model
        };
    }

    parseCodeReview(reviewText) {
        // Simple parsing logic - in a real implementation, you'd use more sophisticated parsing
        const suggestions = {
            score: 7,
            improvements: [],
            security: [],
            performance: []
        };
        
        // Extract score
        const scoreMatch = reviewText.match(/score.*?(\d+)/i);
        if (scoreMatch) {
            suggestions.score = parseInt(scoreMatch[1]);
        }
        
        // Extract suggestions
        const lines = reviewText.split('\n');
        lines.forEach(line => {
            if (line.includes('security') || line.includes('vulnerability')) {
                suggestions.security.push(line.trim());
            } else if (line.includes('performance') || line.includes('optimization')) {
                suggestions.performance.push(line.trim());
            } else if (line.includes('suggestion') || line.includes('improvement')) {
                suggestions.improvements.push(line.trim());
            }
        });
        
        return suggestions;
    }

    updateUsageStats(type) {
        this.usageStats.totalRequests++;
        
        switch (type) {
            case 'chat':
                this.usageStats.openaiRequests++;
                break;
            case 'image':
                this.usageStats.stabilityRequests++;
                break;
            case 'content':
                this.usageStats.anthropicRequests++;
                break;
            case 'code':
                this.usageStats.huggingfaceRequests++;
                break;
        }
    }

    // Widget Components
    getWidgets() {
        return {
            AIChatWidget: this.createAIChatWidget(),
            ImageGeneratorWidget: this.createImageGeneratorWidget(),
            CodeAssistantWidget: this.createCodeAssistantWidget(),
            ContentGeneratorWidget: this.createContentGeneratorWidget()
        };
    }

    createAIChatWidget() {
        return {
            name: 'AIChatWidget',
            template: `
                <div class="ai-chat-widget">
                    <div class="chat-header">
                        <h3>AI Chat Assistant</h3>
                        <select id="ai-model" class="model-selector">
                            <option value="gpt-4">GPT-4</option>
                            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        </select>
                    </div>
                    <div class="chat-messages" id="chat-messages"></div>
                    <div class="chat-input">
                        <textarea id="chat-input" placeholder="Ask me anything..."></textarea>
                        <button id="send-chat">Send</button>
                    </div>
                </div>
            `,
            script: `
                // AI Chat Widget JavaScript
                class AIChatWidget {
                    constructor() {
                        this.messages = [];
                        this.currentModel = 'gpt-4';
                        this.init();
                    }
                    
                    init() {
                        this.bindEvents();
                        this.loadChatHistory();
                    }
                    
                    bindEvents() {
                        document.getElementById('send-chat').addEventListener('click', () => this.sendMessage());
                        document.getElementById('ai-model').addEventListener('change', (e) => {
                            this.currentModel = e.target.value;
                        });
                    }
                    
                    async sendMessage() {
                        const input = document.getElementById('chat-input');
                        const message = input.value.trim();
                        
                        if (!message) return;
                        
                        this.addMessage('user', message);
                        input.value = '';
                        
                        try {
                            const response = await fetch('/api/plugins/ai-services/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    message,
                                    model: this.currentModel
                                })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                this.addMessage('assistant', data.response);
                            } else {
                                this.addMessage('error', 'Error: ' + data.error);
                            }
                        } catch (error) {
                            this.addMessage('error', 'Network error');
                        }
                    }
                    
                    addMessage(role, content) {
                        this.messages.push({ role, content, timestamp: new Date() });
                        this.renderMessages();
                        this.saveChatHistory();
                    }
                    
                    renderMessages() {
                        const container = document.getElementById('chat-messages');
                        container.innerHTML = this.messages.map(msg => `
                            <div class="message ${msg.role}">
                                <div class="message-content">${msg.content}</div>
                                <div class="message-time">${msg.timestamp.toLocaleTimeString()}</div>
                            </div>
                        `).join('');
                        
                        container.scrollTop = container.scrollHeight;
                    }
                    
                    loadChatHistory() {
                        const history = localStorage.getItem('ai-chat-history');
                        if (history) {
                            this.messages = JSON.parse(history);
                            this.renderMessages();
                        }
                    }
                    
                    saveChatHistory() {
                        localStorage.setItem('ai-chat-history', JSON.stringify(this.messages));
                    }
                }
                
                new AIChatWidget();
            `,
            styles: `
                .ai-chat-widget {
                    display: flex;
                    flex-direction: column;
                    height: 400px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                }
                
                .model-selector {
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }
                
                .message {
                    margin-bottom: 12px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    max-width: 80%;
                }
                
                .message.user {
                    background: #007bff;
                    color: white;
                    margin-left: auto;
                }
                
                .message.assistant {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                }
                
                .message.error {
                    background: #dc3545;
                    color: white;
                }
                
                .message-time {
                    font-size: 0.8em;
                    opacity: 0.7;
                    margin-top: 4px;
                }
                
                .chat-input {
                    display: flex;
                    padding: 12px;
                    border-top: 1px solid #ddd;
                }
                
                .chat-input textarea {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    resize: none;
                    height: 60px;
                }
                
                .chat-input button {
                    margin-left: 8px;
                    padding: 8px 16px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .chat-input button:hover {
                    background: #0056b3;
                }
            `
        };
    }

    createImageGeneratorWidget() {
        return {
            name: 'ImageGeneratorWidget',
            template: `
                <div class="image-generator-widget">
                    <h3>AI Image Generator</h3>
                    <div class="generator-form">
                        <textarea id="image-prompt" placeholder="Describe the image you want to generate..."></textarea>
                        <div class="generator-options">
                            <select id="image-size">
                                <option value="1024x1024">Square (1024x1024)</option>
                                <option value="1792x1024">Landscape (1792x1024)</option>
                                <option value="1024x1792">Portrait (1024x1792)</option>
                            </select>
                            <select id="image-style">
                                <option value="">No specific style</option>
                                <option value="photorealistic">Photorealistic</option>
                                <option value="artistic">Artistic</option>
                                <option value="cartoon">Cartoon</option>
                                <option value="abstract">Abstract</option>
                            </select>
                        </div>
                        <button id="generate-image">Generate Image</button>
                    </div>
                    <div class="generated-images" id="generated-images"></div>
                </div>
            `,
            script: `
                // Image Generator Widget JavaScript
                class ImageGeneratorWidget {
                    constructor() {
                        this.init();
                    }
                    
                    init() {
                        this.bindEvents();
                    }
                    
                    bindEvents() {
                        document.getElementById('generate-image').addEventListener('click', () => this.generateImage());
                    }
                    
                    async generateImage() {
                        const prompt = document.getElementById('image-prompt').value.trim();
                        const size = document.getElementById('image-size').value;
                        const style = document.getElementById('image-style').value;
                        
                        if (!prompt) {
                            alert('Please enter a prompt');
                            return;
                        }
                        
                        const button = document.getElementById('generate-image');
                        button.disabled = true;
                        button.textContent = 'Generating...';
                        
                        try {
                            const response = await fetch('/api/plugins/ai-services/generate-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ prompt, size, style })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                this.displayImage(data.imageUrl, prompt);
                            } else {
                                alert('Error: ' + data.error);
                            }
                        } catch (error) {
                            alert('Network error');
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Generate Image';
                        }
                    }
                    
                    displayImage(url, prompt) {
                        const container = document.getElementById('generated-images');
                        const imageDiv = document.createElement('div');
                        imageDiv.className = 'generated-image';
                        imageDiv.innerHTML = \`
                            <img src="\${url}" alt="\${prompt}">
                            <div class="image-info">
                                <p><strong>Prompt:</strong> \${prompt}</p>
                                <button onclick="this.parentElement.parentElement.remove()">Remove</button>
                            </div>
                        \`;
                        
                        container.appendChild(imageDiv);
                    }
                }
                
                new ImageGeneratorWidget();
            `,
            styles: `
                .image-generator-widget {
                    padding: 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                
                .generator-form {
                    margin-bottom: 16px;
                }
                
                .generator-form textarea {
                    width: 100%;
                    height: 80px;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    resize: vertical;
                    margin-bottom: 8px;
                }
                
                .generator-options {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                
                .generator-options select {
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .generator-form button {
                    padding: 8px 16px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .generator-form button:hover {
                    background: #218838;
                }
                
                .generator-form button:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }
                
                .generated-images {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }
                
                .generated-image {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .generated-image img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }
                
                .image-info {
                    padding: 8px;
                }
                
                .image-info p {
                    margin: 0 0 8px 0;
                    font-size: 0.9em;
                }
                
                .image-info button {
                    padding: 4px 8px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8em;
                }
            `
        };
    }

    createCodeAssistantWidget() {
        return {
            name: 'CodeAssistantWidget',
            template: `
                <div class="code-assistant-widget">
                    <h3>AI Code Assistant</h3>
                    <div class="code-form">
                        <select id="code-language">
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="csharp">C#</option>
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                            <option value="go">Go</option>
                        </select>
                        <textarea id="code-input" placeholder="Paste your code here for review..."></textarea>
                        <select id="review-focus">
                            <option value="general">General Review</option>
                            <option value="security">Security Focus</option>
                            <option value="performance">Performance Focus</option>
                            <option value="style">Code Style</option>
                        </select>
                        <button id="review-code">Review Code</button>
                    </div>
                    <div class="review-results" id="review-results"></div>
                </div>
            `,
            script: `
                // Code Assistant Widget JavaScript
                class CodeAssistantWidget {
                    constructor() {
                        this.init();
                    }
                    
                    init() {
                        this.bindEvents();
                    }
                    
                    bindEvents() {
                        document.getElementById('review-code').addEventListener('click', () => this.reviewCode());
                    }
                    
                    async reviewCode() {
                        const code = document.getElementById('code-input').value.trim();
                        const language = document.getElementById('code-language').value;
                        const focus = document.getElementById('review-focus').value;
                        
                        if (!code) {
                            alert('Please paste some code to review');
                            return;
                        }
                        
                        const button = document.getElementById('review-code');
                        button.disabled = true;
                        button.textContent = 'Reviewing...';
                        
                        try {
                            const response = await fetch('/api/plugins/ai-services/code-review', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code, language, focus })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                this.displayReview(data.review, data.score);
                            } else {
                                alert('Error: ' + data.error);
                            }
                        } catch (error) {
                            alert('Network error');
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Review Code';
                        }
                    }
                    
                    displayReview(review, score) {
                        const container = document.getElementById('review-results');
                        container.innerHTML = \`
                            <div class="review-score">
                                <h4>Code Quality Score: \${score}/10</h4>
                            </div>
                            <div class="review-sections">
                                <div class="review-section">
                                    <h5>Improvements</h5>
                                    <ul>\${review.improvements.map(item => \`<li>\${item}</li>\`).join('')}</ul>
                                </div>
                                <div class="review-section">
                                    <h5>Security</h5>
                                    <ul>\${review.security.map(item => \`<li>\${item}</li>\`).join('')}</ul>
                                </div>
                                <div class="review-section">
                                    <h5>Performance</h5>
                                    <ul>\${review.performance.map(item => \`<li>\${item}</li>\`).join('')}</ul>
                                </div>
                            </div>
                        \`;
                    }
                }
                
                new CodeAssistantWidget();
            `,
            styles: `
                .code-assistant-widget {
                    padding: 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                
                .code-form {
                    margin-bottom: 16px;
                }
                
                .code-form select {
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    width: 100%;
                }
                
                .code-form textarea {
                    width: 100%;
                    height: 120px;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    resize: vertical;
                    font-family: 'Courier New', monospace;
                    margin-bottom: 8px;
                }
                
                .code-form button {
                    padding: 8px 16px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .code-form button:hover {
                    background: #138496;
                }
                
                .code-form button:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }
                
                .review-results {
                    border-top: 1px solid #ddd;
                    padding-top: 16px;
                }
                
                .review-score {
                    margin-bottom: 16px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                
                .review-sections {
                    display: grid;
                    gap: 16px;
                }
                
                .review-section h5 {
                    margin: 0 0 8px 0;
                    color: #495057;
                }
                
                .review-section ul {
                    margin: 0;
                    padding-left: 20px;
                }
                
                .review-section li {
                    margin-bottom: 4px;
                    font-size: 0.9em;
                }
            `
        };
    }

    createContentGeneratorWidget() {
        return {
            name: 'ContentGeneratorWidget',
            template: `
                <div class="content-generator-widget">
                    <h3>AI Content Generator</h3>
                    <div class="content-form">
                        <select id="content-type">
                            <option value="blog">Blog Post</option>
                            <option value="article">Article</option>
                            <option value="social">Social Media Post</option>
                            <option value="email">Email</option>
                        </select>
                        <textarea id="content-prompt" placeholder="Describe what you want to write about..."></textarea>
                        <select id="content-length">
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                        </select>
                        <button id="generate-content">Generate Content</button>
                    </div>
                    <div class="generated-content" id="generated-content"></div>
                </div>
            `,
            script: `
                // Content Generator Widget JavaScript
                class ContentGeneratorWidget {
                    constructor() {
                        this.init();
                    }
                    
                    init() {
                        this.bindEvents();
                    }
                    
                    bindEvents() {
                        document.getElementById('generate-content').addEventListener('click', () => this.generateContent());
                    }
                    
                    async generateContent() {
                        const type = document.getElementById('content-type').value;
                        const prompt = document.getElementById('content-prompt').value.trim();
                        const length = document.getElementById('content-length').value;
                        
                        if (!prompt) {
                            alert('Please describe what you want to write about');
                            return;
                        }
                        
                        const button = document.getElementById('generate-content');
                        button.disabled = true;
                        button.textContent = 'Generating...';
                        
                        try {
                            const response = await fetch('/api/plugins/ai-services/generate-content', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ type, prompt, length })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                this.displayContent(data.content, type);
                            } else {
                                alert('Error: ' + data.error);
                            }
                        } catch (error) {
                            alert('Network error');
                        } finally {
                            button.disabled = false;
                            button.textContent = 'Generate Content';
                        }
                    }
                    
                    displayContent(content, type) {
                        const container = document.getElementById('generated-content');
                        container.innerHTML = \`
                            <div class="content-result">
                                <h4>\${type.charAt(0).toUpperCase() + type.slice(1)} Content</h4>
                                <div class="content-text">\${content.replace(/\\n/g, '<br>')}</div>
                                <div class="content-actions">
                                    <button onclick="navigator.clipboard.writeText('\${content}')">Copy to Clipboard</button>
                                    <button onclick="this.parentElement.parentElement.remove()">Remove</button>
                                </div>
                            </div>
                        \`;
                    }
                }
                
                new ContentGeneratorWidget();
            `,
            styles: `
                .content-generator-widget {
                    padding: 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                
                .content-form {
                    margin-bottom: 16px;
                }
                
                .content-form select {
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 8px;
                    width: 100%;
                }
                
                .content-form textarea {
                    width: 100%;
                    height: 80px;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    resize: vertical;
                    margin-bottom: 8px;
                }
                
                .content-form button {
                    padding: 8px 16px;
                    background: #6f42c1;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .content-form button:hover {
                    background: #5a32a3;
                }
                
                .content-form button:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }
                
                .content-result {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                
                .content-result h4 {
                    margin: 0 0 12px 0;
                    color: #495057;
                }
                
                .content-text {
                    line-height: 1.6;
                    margin-bottom: 16px;
                    white-space: pre-wrap;
                }
                
                .content-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .content-actions button {
                    padding: 4px 8px;
                    border: 1px solid #ccc;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8em;
                }
                
                .content-actions button:hover {
                    background: #e9ecef;
                }
            `
        };
    }
}

module.exports = AIServicesPlugin;

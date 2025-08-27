const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const natural = require('natural');
const BeamErrorHandler = require('../../../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../../../utils/BeamPerformanceMonitor');

class AIAssistantPlugin {
    constructor() {
        this.name = 'AI Assistant Plugin';
        this.version = '1.0.0';
        this.description = 'Advanced AI assistant with code analysis and content generation';
        this.author = 'BeamFlow System';
        
        this.settings = {};
        this.chatHistory = new Map();
        this.codeAnalysisCache = new Map();
        this.contentTemplates = new Map();
        
        this.initializeSettings();
        this.loadTemplates();
    }

    async initializeSettings() {
        try {
            this.settings = {
                openai_api_key: process.env.OPENAI_API_KEY || '',
                model_name: 'gpt-4',
                max_tokens: 2000,
                temperature: 0.7,
                code_analysis_enabled: true,
                content_generation_enabled: true,
                auto_suggestions_enabled: true,
                context_window_size: 10
            };
        } catch (error) {
            BeamErrorHandler.logError('AI Assistant Settings Initialization Error', error);
        }
    }

    async loadTemplates() {
        try {
            const templatesDir = path.join(__dirname, 'templates');
            if (await fs.pathExists(templatesDir)) {
                const templateFiles = await fs.readdir(templatesDir);
                for (const file of templateFiles) {
                    if (file.endsWith('.json')) {
                        const templatePath = path.join(templatesDir, file);
                        const template = await fs.readJson(templatePath);
                        this.contentTemplates.set(template.name, template);
                    }
                }
            }
        } catch (error) {
            BeamErrorHandler.logError('AI Assistant Template Loading Error', error);
        }
    }

    async onSystemStart() {
        try {
            console.log(' AI Assistant Plugin initialized');
            BeamPerformanceMonitor.recordPluginStart('ai-assistant');
            
            // Initialize AI services
            await this.initializeAIServices();
            
        } catch (error) {
            BeamErrorHandler.logError('AI Assistant System Start Error', error);
        }
    }

    async initializeAIServices() {
        try {
            if (!this.settings.openai_api_key) {
                console.warn(' OpenAI API key not configured. Some AI features will be limited.');
                return;
            }

            // Test API connection
            await this.testOpenAIConnection();
            console.log(' AI services initialized successfully');
            
        } catch (error) {
            BeamErrorHandler.logError('AI Services Initialization Error', error);
        }
    }

    async testOpenAIConnection() {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            }, {
                headers: {
                    'Authorization': `Bearer ${this.settings.openai_api_key}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.status === 200;
        } catch (error) {
            throw new Error(`OpenAI API test failed: ${error.message}`);
        }
    }

    async processChat(req, res) {
        try {
            const { message, userId, context } = req.body;
            
            if (!message || !userId) {
                return res.status(400).json({ error: 'Message and userId are required' });
            }

            BeamPerformanceMonitor.startTimer('ai-chat-processing');

            // Get user chat history
            const userHistory = this.chatHistory.get(userId) || [];
            
            // Prepare context
            const conversationContext = this.buildConversationContext(userHistory, context);
            
            // Generate AI response
            const aiResponse = await this.generateAIResponse(message, conversationContext);
            
            // Update chat history
            userHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });
            
            userHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });

            // Maintain context window size
            if (userHistory.length > this.settings.context_window_size * 2) {
                userHistory.splice(0, userHistory.length - this.settings.context_window_size * 2);
            }
            
            this.chatHistory.set(userId, userHistory);

            BeamPerformanceMonitor.endTimer('ai-chat-processing');

            res.json({
                response: aiResponse,
                timestamp: new Date(),
                context: conversationContext.length
            });

        } catch (error) {
            BeamErrorHandler.logError('AI Chat Processing Error', error);
            res.status(500).json({ error: 'Failed to process chat message' });
        }
    }

    async analyzeCode(req, res) {
        try {
            const { code, language, userId } = req.body;
            
            if (!code || !language) {
                return res.status(400).json({ error: 'Code and language are required' });
            }

            BeamPerformanceMonitor.startTimer('code-analysis');

            // Check cache first
            const cacheKey = `${language}_${this.hashCode(code)}`;
            if (this.codeAnalysisCache.has(cacheKey)) {
                const cached = this.codeAnalysisCache.get(cacheKey);
                return res.json(cached);
            }

            // Perform code analysis
            const analysis = await this.performCodeAnalysis(code, language);
            
            // Cache the result
            this.codeAnalysisCache.set(cacheKey, analysis);

            BeamPerformanceMonitor.endTimer('code-analysis');

            res.json(analysis);

        } catch (error) {
            BeamErrorHandler.logError('Code Analysis Error', error);
            res.status(500).json({ error: 'Failed to analyze code' });
        }
    }

    async generateContent(req, res) {
        try {
            const { prompt, contentType, userId, options = {} } = req.body;
            
            if (!prompt || !contentType) {
                return res.status(400).json({ error: 'Prompt and contentType are required' });
            }

            BeamPerformanceMonitor.startTimer('content-generation');

            // Get content template
            const template = this.contentTemplates.get(contentType) || this.getDefaultTemplate(contentType);
            
            // Generate content
            const content = await this.generateContentWithAI(prompt, template, options);

            BeamPerformanceMonitor.endTimer('content-generation');

            res.json({
                content,
                contentType,
                timestamp: new Date(),
                template: template.name
            });

        } catch (error) {
            BeamErrorHandler.logError('Content Generation Error', error);
            res.status(500).json({ error: 'Failed to generate content' });
        }
    }

    async getSuggestions(req, res) {
        try {
            const { context, userId } = req.query;
            
            if (!this.settings.auto_suggestions_enabled) {
                return res.json({ suggestions: [] });
            }

            const suggestions = await this.generateSuggestions(context, userId);
            
            res.json({ suggestions });

        } catch (error) {
            BeamErrorHandler.logError('Suggestion Generation Error', error);
            res.status(500).json({ error: 'Failed to generate suggestions' });
        }
    }

    async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            const { userId } = req.user;

            // Validate permissions
            if (!this.hasPermission(userId, 'plugin:ai-assistant:admin')) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            // Update settings
            this.settings = { ...this.settings, ...settings };
            
            // Reinitialize AI services if API key changed
            if (settings.openai_api_key) {
                await this.initializeAIServices();
            }

            res.json({ 
                message: 'Settings updated successfully',
                settings: this.settings 
            });

        } catch (error) {
            BeamErrorHandler.logError('Settings Update Error', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }

    async getChatHistory(req, res) {
        try {
            const { userId } = req.user;
            const { limit = 50 } = req.query;

            const history = this.chatHistory.get(userId) || [];
            const limitedHistory = history.slice(-parseInt(limit));

            res.json({
                history: limitedHistory,
                total: history.length
            });

        } catch (error) {
            BeamErrorHandler.logError('Chat History Error', error);
            res.status(500).json({ error: 'Failed to retrieve chat history' });
        }
    }

    // Helper methods
    async generateAIResponse(message, context) {
        try {
            if (!this.settings.openai_api_key) {
                return this.getFallbackResponse(message);
            }

            const messages = [
                { role: 'system', content: 'You are a helpful AI assistant integrated into the BeamFlow system.' },
                ...context,
                { role: 'user', content: message }
            ];

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.settings.model_name,
                messages,
                max_tokens: this.settings.max_tokens,
                temperature: this.settings.temperature
            }, {
                headers: {
                    'Authorization': `Bearer ${this.settings.openai_api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;

        } catch (error) {
            BeamErrorHandler.logError('AI Response Generation Error', error);
            return this.getFallbackResponse(message);
        }
    }

    async performCodeAnalysis(code, language) {
        try {
            const analysis = {
                language,
                complexity: this.calculateComplexity(code),
                suggestions: [],
                issues: [],
                metrics: {}
            };

            // Basic code analysis
            analysis.metrics = {
                lines: code.split('\n').length,
                characters: code.length,
                functions: this.countFunctions(code, language),
                comments: this.countComments(code, language)
            };

            // Generate suggestions using AI
            if (this.settings.openai_api_key) {
                const suggestions = await this.generateCodeSuggestions(code, language);
                analysis.suggestions = suggestions;
            }

            // Detect common issues
            analysis.issues = this.detectCodeIssues(code, language);

            return analysis;

        } catch (error) {
            BeamErrorHandler.logError('Code Analysis Performance Error', error);
            return { error: 'Failed to analyze code' };
        }
    }

    async generateContentWithAI(prompt, template, options) {
        try {
            if (!this.settings.openai_api_key) {
                return this.generateBasicContent(prompt, template);
            }

            const systemPrompt = template.systemPrompt || 'You are a content generation assistant.';
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `${template.promptPrefix || ''} ${prompt}` }
            ];

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.settings.model_name,
                messages,
                max_tokens: options.maxTokens || this.settings.max_tokens,
                temperature: options.temperature || this.settings.temperature
            }, {
                headers: {
                    'Authorization': `Bearer ${this.settings.openai_api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;

        } catch (error) {
            BeamErrorHandler.logError('Content Generation AI Error', error);
            return this.generateBasicContent(prompt, template);
        }
    }

    // Utility methods
    buildConversationContext(history, additionalContext = []) {
        const context = [...additionalContext];
        
        if (history.length > 0) {
            const recentHistory = history.slice(-this.settings.context_window_size);
            context.push(...recentHistory);
        }
        
        return context;
    }

    getFallbackResponse(message) {
        const responses = [
            "I'm here to help! What can I assist you with?",
            "I understand you're asking about that. Let me help you find the information you need.",
            "That's an interesting question. Here's what I can tell you about that topic.",
            "I'd be happy to help with that. What specific aspect would you like to know more about?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    calculateComplexity(code) {
        // Simple cyclomatic complexity calculation
        const complexity = (code.match(/if|else|for|while|switch|case|catch/g) || []).length + 1;
        return complexity;
    }

    countFunctions(code, language) {
        const patterns = {
            'javascript': /function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|var\s+\w+\s*=\s*\(/g,
            'python': /def\s+\w+/g,
            'java': /public\s+\w+\s+\w+\s*\(|private\s+\w+\s+\w+\s*\(|protected\s+\w+\s+\w+\s*\(/g
        };
        
        const pattern = patterns[language.toLowerCase()] || patterns['javascript'];
        return (code.match(pattern) || []).length;
    }

    countComments(code, language) {
        const patterns = {
            'javascript': /\/\/.*$|\/\*[\s\S]*?\*\//gm,
            'python': /#.*$|"""[\s\S]*?"""|'''[\s\S]*?'''/gm,
            'java': /\/\/.*$|\/\*[\s\S]*?\*\//gm
        };
        
        const pattern = patterns[language.toLowerCase()] || patterns['javascript'];
        return (code.match(pattern) || []).length;
    }

    detectCodeIssues(code, language) {
        const issues = [];
        
        // Check for common issues
        if (code.includes('console.log') && !code.includes('// TODO: Remove console.log')) {
            issues.push({ type: 'warning', message: 'Debug console.log statements found' });
        }
        
        if (code.includes('TODO') || code.includes('FIXME')) {
            issues.push({ type: 'info', message: 'TODO/FIXME comments found' });
        }
        
        if (code.length > 1000) {
            issues.push({ type: 'warning', message: 'Large code block detected' });
        }
        
        return issues;
    }

    getDefaultTemplate(contentType) {
        const templates = {
            'blog-post': {
                name: 'Blog Post',
                systemPrompt: 'You are a professional blog writer. Create engaging, informative content.',
                promptPrefix: 'Write a blog post about:'
            },
            'email': {
                name: 'Email',
                systemPrompt: 'You are a professional email writer. Create clear, concise emails.',
                promptPrefix: 'Write an email about:'
            },
            'documentation': {
                name: 'Documentation',
                systemPrompt: 'You are a technical writer. Create clear, comprehensive documentation.',
                promptPrefix: 'Write documentation for:'
            }
        };
        
        return templates[contentType] || templates['blog-post'];
    }

    generateBasicContent(prompt, template) {
        return `Generated content for: ${prompt}\n\nThis is a basic content generation response. For enhanced AI-powered content, please configure your OpenAI API key.`;
    }

    async generateCodeSuggestions(code, language) {
        try {
            const prompt = `Analyze this ${language} code and provide improvement suggestions:\n\n${code}`;
            
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.settings.model_name,
                messages: [
                    { role: 'system', content: 'You are a code review expert. Provide specific, actionable suggestions for code improvement.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.settings.openai_api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            return [response.data.choices[0].message.content];

        } catch (error) {
            return ['Enable OpenAI API for code suggestions'];
        }
    }

    async generateSuggestions(context, userId) {
        const suggestions = [
            'Try asking me to analyze some code',
            'I can help you generate content for blogs, emails, or documentation',
            'Ask me to explain complex topics in simple terms',
            'I can help you debug code issues'
        ];
        
        return suggestions.slice(0, 3);
    }

    hasPermission(userId, permission) {
        // This would integrate with your existing permission system
        return true; // Placeholder
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // WebSocket handlers
    handleChatMessage(socket, data) {
        this.processChat({ body: data }, { json: (response) => socket.emit('chat_response', response) });
    }

    handleCodeAnalysis(socket, data) {
        this.analyzeCode({ body: data }, { json: (response) => socket.emit('code_analysis_response', response) });
    }
}

module.exports = AIAssistantPlugin;

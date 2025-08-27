# Beam Plugin System - Complete Guide

## Overview

The Beam Plugin System is a comprehensive framework that allows you to extend your Beam application with custom functionality. Plugins can be toggled between **public access** (available on public pages) and **admin-only** (private dashboard), giving you complete control over feature visibility.

## Key Features

### 🔄 **Toggle Functionality**
- **Public Mode**: Plugin features available on public pages
- **Admin Mode**: Plugin features only in private admin dashboard
- **Dynamic Switching**: Change access levels without restarting

### 🎨 **Self-Contained Plugins**
- Each plugin has its own folder with all required files
- Independent CSS, JavaScript, and assets
- Custom UI components with animations
- Complete isolation from other plugins

### 🤖 **AI Chat Integration**
- Plugins automatically integrate with AI chat
- Natural language commands for plugin features
- Seamless execution of plugin functions
- Context-aware responses

### 📦 **Easy Management**
- Install/uninstall plugins dynamically
- Enable/disable plugins with one click
- Update plugin configurations
- Monitor plugin performance

## Plugin Structure

```
src/plugins/installed/
├── plugin-name/
│   ├── manifest.json          # Plugin metadata and configuration
│   ├── index.js              # Main plugin functionality
│   ├── routes.js             # API endpoints
│   ├── ui.js                 # UI components
│   ├── config.json           # Default configuration
│   └── assets/
│       ├── styles.css        # Plugin-specific styles
│       ├── script.js         # Plugin-specific JavaScript
│       ├── images/           # Plugin images
│       └── fonts/            # Plugin fonts
```

## Creating a Plugin

### 1. Plugin Manifest (`manifest.json`)

```json
{
  "name": "Your Plugin Name",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "author": "Your Name",
  "main": "index.js",
  "routes": "routes.js",
  "ui": "ui.js",
  "assets": "assets",
  "config": "config.json",
  "capabilities": {
    "feature_type": {
      "provider": "service_name",
      "options": ["option1", "option2"]
    },
    "ai_chat_integration": {
      "commands": [
        "command1",
        "command2"
      ],
      "parameters": {
        "param1": "string",
        "param2": "number"
      }
    }
  },
  "settings": {
    "public_access": {
      "type": "boolean",
      "default": false,
      "description": "Allow public access to plugin features"
    },
    "api_key": {
      "type": "string",
      "required": true,
      "description": "API key for external service"
    }
  },
  "dependencies": {
    "external-package": "^1.0.0"
  },
  "permissions": {
    "admin": ["full_access"],
    "user": ["basic_access"],
    "public": ["limited_access"]
  }
}
```

### 2. Main Plugin File (`index.js`)

```javascript
class YourPlugin {
    constructor() {
        this.config = {};
        this.isInitialized = false;
    }

    async init(config) {
        try {
            this.config = config;
            this.isInitialized = true;
            
            // Initialize your plugin
            console.log('Your plugin initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize plugin:', error);
            return false;
        }
    }

    // Your plugin functions
    async yourFunction(param1, param2) {
        // Plugin logic here
        return { success: true, data: 'result' };
    }

    // AI Chat Integration
    async handleAIChatCommand(message, userId) {
        // Parse commands and execute functions
        const commandMatch = message.match(/your command pattern/i);
        
        if (commandMatch) {
            const result = await this.yourFunction(param1, param2);
            return {
                type: 'your_feature',
                success: true,
                message: 'Command executed successfully!',
                data: result
            };
        }
        
        return null; // Not a command for this plugin
    }

    async cleanup() {
        // Cleanup resources
        console.log('Plugin cleaned up');
    }
}

module.exports = new YourPlugin();
```

### 3. Routes File (`routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const BeamAuth = require('../../../middleware/BeamAuth');
const BeamPluginSystem = require('../BeamPluginSystem');

class YourPluginRoutes {
    constructor() {
        this.router = router;
        this.pluginSystem = BeamPluginSystem;
        this.setupRoutes();
    }

    setupRoutes() {
        // Your API endpoints
        this.router.post('/action', BeamAuth.requireAuth, this.handleAction.bind(this));
        this.router.get('/data', BeamAuth.requireAuth, this.getData.bind(this));
        
        // Public endpoint (if enabled)
        this.router.post('/public/action', this.publicAction.bind(this));
    }

    async handleAction(req, res) {
        try {
            const { param1, param2 } = req.body;
            const userId = req.user.id;

            const result = await this.pluginSystem.executePluginFunction(
                'your-plugin-name',
                'yourFunction',
                param1,
                param2
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async publicAction(req, res) {
        // Check if public access is enabled
        const plugin = this.pluginSystem.getPlugin('your-plugin-name');
        if (!plugin || !plugin.config.public_access) {
            return res.status(403).json({
                success: false,
                error: 'Public access disabled'
            });
        }

        // Handle public action
    }

    async init(config) {
        console.log('Plugin routes initialized');
        return true;
    }

    async cleanup() {
        console.log('Plugin routes cleaned up');
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new YourPluginRoutes();
```

### 4. UI Component (`ui.js`)

```javascript
class YourPluginUI {
    constructor() {
        this.container = null;
        this.config = {};
    }

    async init(config) {
        this.config = config;
        this.registerUIComponents();
        return true;
    }

    registerUIComponents() {
        if (typeof window !== 'undefined' && window.BeamUI) {
            window.BeamUI.registerComponent('your-plugin', {
                render: this.render.bind(this),
                mount: this.mount.bind(this),
                unmount: this.unmount.bind(this)
            });
        }
    }

    render() {
        return `
            <div class="beam-plugin-your-plugin">
                <div class="plugin-header">
                    <h3>Your Plugin</h3>
                    <div class="plugin-status ${this.config.enabled ? 'active' : 'inactive'}">
                        ${this.config.enabled ? 'Active' : 'Inactive'}
                    </div>
                </div>
                
                <div class="plugin-content">
                    <!-- Your plugin UI here -->
                    <div class="feature-section">
                        <h4>Your Feature</h4>
                        <button id="action-btn" class="btn btn-primary">
                            Perform Action
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    mount(container) {
        this.container = container;
        this.bindEvents();
    }

    unmount() {
        if (this.container) {
            this.unbindEvents();
            this.container = null;
        }
    }

    bindEvents() {
        const actionBtn = this.container.querySelector('#action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', this.handleAction.bind(this));
        }
    }

    unbindEvents() {
        // Remove event listeners
    }

    async handleAction() {
        // Handle user actions
    }

    async cleanup() {
        this.unmount();
    }
}

module.exports = new YourPluginUI();
```

### 5. Configuration (`config.json`)

```json
{
  "enabled": false,
  "public_access": false,
  "api_key": "",
  "feature_setting": "default",
  "advanced_options": {
    "option1": true,
    "option2": "value"
  },
  "integrations": {
    "ai_chat_enabled": true,
    "public_api_enabled": false
  },
  "security": {
    "require_authentication": true,
    "admin_only": false
  }
}
```

## Example Plugins

### 1. OpenAI Image Generator
- **Purpose**: Generate images using DALL-E
- **Features**: Multiple models, sizes, styles
- **AI Chat**: "Generate image of a cat"
- **Toggle**: Public/Admin access

### 2. NSFW AI Girlfriend
- **Purpose**: AI companion with personality
- **Features**: Chat, voice, image generation
- **AI Chat**: "Talk to my AI girlfriend"
- **Toggle**: Admin-only (private)

### 3. Voice Assistant
- **Purpose**: Voice commands and responses
- **Features**: Speech-to-text, text-to-speech
- **AI Chat**: "Voice command: play music"
- **Toggle**: Public/Admin access

### 4. Video Player
- **Purpose**: Custom video player with features
- **Features**: Playlists, streaming, controls
- **AI Chat**: "Play video playlist"
- **Toggle**: Public/Admin access

### 5. IPTV Plugin
- **Purpose**: Internet Protocol Television
- **Features**: XML/EPG support, channels
- **AI Chat**: "Show TV channels"
- **Toggle**: Public/Admin access

## Plugin Management

### Installing a Plugin

```javascript
// Via API
const response = await fetch('/api/plugins/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        pluginPath: '/path/to/plugin',
        pluginName: 'my-plugin'
    })
});

// Via AI Chat
"Install plugin named my-plugin"
```

### Enabling/Disabling

```javascript
// Enable plugin
await pluginSystem.enablePlugin('plugin-name', config);

// Disable plugin
await pluginSystem.disablePlugin('plugin-name');

// Via AI Chat
"Enable plugin named my-plugin"
"Disable plugin named my-plugin"
```

### Updating Configuration

```javascript
// Update settings
await pluginSystem.updatePluginConfig('plugin-name', {
    public_access: true,
    api_key: 'new-key'
});

// Via AI Chat
"Update plugin my-plugin public access to true"
```

## AI Chat Integration

### Automatic Integration
Plugins automatically integrate with AI chat when they include `ai_chat_integration` in their manifest:

```json
{
  "ai_chat_integration": {
    "commands": [
      "generate image",
      "create picture"
    ],
    "parameters": {
      "prompt": "string",
      "size": "string"
    }
  }
}
```

### Command Handling
The AI chat system automatically:
1. Detects plugin commands in user messages
2. Parses parameters using regex patterns
3. Executes plugin functions
4. Returns formatted responses

### Example Commands
```
"Generate image of a sunset"
"Create picture size 1024x1024"
"Enable plugin openai-image-generator"
"Update plugin settings public access true"
```

## Security & Permissions

### Permission Levels
- **Admin**: Full access to all plugin features
- **User**: Basic access based on plugin settings
- **Public**: Limited access when public_access is enabled

### Security Features
- Authentication required for admin functions
- Rate limiting per user
- IP whitelisting support
- Domain restrictions
- Content filtering

## Best Practices

### 1. Plugin Design
- Keep plugins self-contained
- Use clear, descriptive names
- Include comprehensive documentation
- Handle errors gracefully

### 2. UI/UX
- Follow Beam design patterns
- Include loading states
- Provide clear feedback
- Make interfaces responsive

### 3. Performance
- Minimize resource usage
- Implement proper cleanup
- Use efficient algorithms
- Cache when appropriate

### 4. Security
- Validate all inputs
- Sanitize user data
- Implement rate limiting
- Log security events

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check manifest.json syntax
   - Verify file paths
   - Check console for errors

2. **AI Chat not recognizing commands**
   - Verify command patterns in manifest
   - Check handleAIChatCommand implementation
   - Test regex patterns

3. **Public access not working**
   - Check public_access setting
   - Verify route permissions
   - Test authentication logic

4. **UI not rendering**
   - Check CSS file paths
   - Verify component registration
   - Test in different browsers

### Debug Mode
Enable debug logging:
```javascript
// In your plugin
console.log('Plugin debug:', data);

// Check plugin system logs
BeamLogger.debug('Plugin operation:', details);
```

## Future Enhancements

### Planned Features
- Plugin marketplace
- Auto-updates
- Plugin dependencies
- Advanced analytics
- Plugin templates
- Visual plugin builder

### Integration Possibilities
- Third-party services
- External APIs
- Webhook support
- Real-time features
- Mobile apps

---

*The Beam Plugin System provides unlimited possibilities for extending your application. Create plugins for any functionality you need, from simple utilities to complex AI integrations.*

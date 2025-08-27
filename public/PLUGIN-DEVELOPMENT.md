# Beam Plugin Development Guide

This guide covers the enhanced plugin system for the Beam Website System, including all features, best practices, and examples.

## Table of Contents

1. [Overview](#overview)
2. [Plugin Structure](#plugin-structure)
3. [Manifest Configuration](#manifest-configuration)
4. [Plugin Lifecycle](#plugin-lifecycle)
5. [Plugin API](#plugin-api)
6. [Hooks System](#hooks-system)
7. [Security Features](#security-features)
8. [Database Integration](#database-integration)
9. [Configuration Management](#configuration-management)
10. [Health Monitoring](#health-monitoring)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Best Practices](#best-practices)

## Overview

The Beam plugin system is a powerful, secure, and extensible architecture that allows developers to extend the functionality of the Beam Website System. Plugins can:

- Add new features and functionality
- Integrate with external services
- Customize the admin interface
- Add new content types
- Implement custom workflows
- Extend the API
- Add scheduled tasks
- Handle webhooks

## Plugin Structure

A plugin consists of the following structure:

```
my-plugin/
├── manifest.json          # Plugin configuration
├── index.js              # Main plugin file
├── package.json          # Dependencies (optional)
├── assets/               # Static assets
│   ├── styles.css
│   └── script.js
├── views/                # Template files
│   └── admin.ejs
├── migrations/           # Database migrations
│   ├── 1.0.1-up.js
│   └── 1.0.1-down.js
├── commands/             # CLI commands
│   └── setup.js
├── tests/                # Test files
│   └── plugin.test.js
└── README.md             # Documentation
```

## Manifest Configuration

The `manifest.json` file defines all aspects of your plugin:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A description of your plugin",
  "main": "index.js",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/username/my-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-plugin.git"
  },
  "keywords": ["beam", "plugin", "example"],
  "engines": {
    "node": ">=16.0.0",
    "beam": ">=1.0.0"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "peerDependencies": {
    "express": "^4.18.0"
  },
  "optionalDependencies": {
    "redis": "^4.6.0"
  },
  "permissions": [
    "read:content",
    "write:content",
    "read:users",
    "read:analytics"
  ],
  "hooks": [
    "onContentCreate",
    "onContentUpdate",
    "onUserCreate"
  ],
  "hookPriorities": {
    "onContentCreate": 5,
    "onContentUpdate": 5
  },
  "configSchema": {
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Enable the plugin"
    },
    "apiKey": {
      "type": "string",
      "default": "",
      "description": "API key for external service",
      "secret": true
    }
  },
  "defaultConfig": {
    "enabled": true,
    "apiKey": ""
  }
}
```

### Required Fields

- `name`: Unique plugin name (lowercase, no spaces)
- `version`: Semantic version (e.g., "1.0.0")
- `description`: Brief description of the plugin
- `main`: Entry point file (usually "index.js")

### Optional Fields

- `author`: Plugin author
- `license`: License type
- `homepage`: Plugin homepage URL
- `repository`: Git repository information
- `keywords`: Search keywords
- `engines`: Required Node.js and Beam versions
- `dependencies`: Required npm packages
- `peerDependencies`: Peer dependencies
- `optionalDependencies`: Optional dependencies

### Security Fields

- `permissions`: Array of required permissions
- `hooks`: Array of hook names the plugin uses
- `hookPriorities`: Priority levels for hooks

### Configuration Fields

- `configSchema`: Configuration schema definition
- `defaultConfig`: Default configuration values

## Plugin Lifecycle

Plugins go through several lifecycle stages:

### 1. Installation

```javascript
// Plugin is copied to plugins directory
// Manifest is validated
// Dependencies are checked
// Database tables are created
```

### 2. Loading

```javascript
// Plugin module is loaded
// Integrity is validated
// Sandbox is created
// Plugin is registered
```

### 3. Activation

```javascript
// Dependencies are verified
// Permissions are checked
// Plugin is initialized
// Hooks are registered
// Status is set to 'active'
```

### 4. Runtime

```javascript
// Plugin responds to events
// Handles API requests
// Processes hooks
// Monitors health
```

### 5. Deactivation

```javascript
// Hooks are unregistered
// Plugin cleanup is performed
// Status is set to 'inactive'
```

### 6. Uninstallation

```javascript
// Plugin is deactivated
// Database tables are removed
// Files are deleted
// Registry is updated
```

## Plugin API

The plugin API provides access to core system functionality:

### Core Services

```javascript
class MyPlugin {
  async initialize(api) {
    this.api = api;
    
    // Access core services
    this.logger = api.logger;
    this.database = api.database;
    this.events = api.events;
  }
}
```

### Settings Management

```javascript
// Get setting with default value
const setting = await this.api.getSetting('my-setting', 'default');

// Set setting
await this.api.setSetting('my-setting', 'value', 'string');
```

### Content Management

```javascript
// Create content
const content = await this.api.createContent({
  title: 'My Content',
  content: 'Content body',
  type: 'post'
});

// Update content
await this.api.updateContent(contentId, {
  title: 'Updated Title'
});
```

### User Management

```javascript
// Get user
const user = await this.api.getUser(userId);
```

### File Management

```javascript
// Upload file
const file = await this.api.uploadFile(fileData, {
  type: 'image',
  resize: true
});
```

### Email Service

```javascript
// Send email
await this.api.sendEmail('user@example.com', 'welcome', {
  username: 'john',
  siteName: 'My Site'
});
```

### Notification Service

```javascript
// Send notification
await this.api.sendNotification(userId, {
  type: 'info',
  title: 'Welcome!',
  message: 'Welcome to our site!'
});
```

### Analytics

```javascript
// Track event
await this.api.trackEvent('user_action', {
  action: 'button_click',
  page: '/home'
});
```

### Security

```javascript
// Validate input
const isValid = this.api.validateInput(data, {
  name: 'string',
  email: 'string',
  age: 'number'
});

// Sanitize input
const sanitized = this.api.sanitizeInput(userInput);
```

### Utilities

```javascript
// Generate slug
const slug = this.api.generateSlug('My Post Title');

// Format date
const formatted = this.api.formatDate(new Date());

// Cache management
this.api.setCache('key', 'value', 3600); // TTL in seconds
const cached = this.api.getCache('key');
```

## Hooks System

Hooks allow plugins to respond to system events:

### Available Hooks

- `onContentCreate`: When content is created
- `onContentUpdate`: When content is updated
- `onContentDelete`: When content is deleted
- `onUserCreate`: When user is created
- `onUserUpdate`: When user is updated
- `onUserDelete`: When user is deleted
- `onFileUpload`: When file is uploaded
- `onFileDelete`: When file is deleted
- `onPluginActivate`: When plugin is activated
- `onPluginDeactivate`: When plugin is deactivated
- `onSystemStart`: When system starts
- `onSystemShutdown`: When system shuts down
- `onRequest`: On HTTP request
- `onResponse`: On HTTP response
- `onError`: On system error
- `onWarning`: On system warning

### Implementing Hooks

```javascript
class MyPlugin {
  async onContentCreate(data) {
    // Handle content creation
    this.logger.info('Content created', { contentId: data.id });
    
    // Track analytics
    await this.api.trackEvent('content_created', {
      content_id: data.id,
      type: data.type
    });
    
    // Send notification
    await this.api.sendNotification(data.user_id, {
      type: 'success',
      title: 'Content Created',
      message: 'Your content has been created successfully!'
    });
    
    return { success: true };
  }
  
  async onUserCreate(data) {
    // Handle user creation
    this.logger.info('User created', { userId: data.id });
    
    // Send welcome email
    await this.api.sendEmail(data.email, 'welcome', {
      username: data.username
    });
    
    return { success: true };
  }
}
```

### Hook Priorities

Hooks can have priorities (higher numbers execute first):

```json
{
  "hookPriorities": {
    "onContentCreate": 10,
    "onContentUpdate": 5
  }
}
```

## Security Features

### Permission System

Plugins must declare required permissions:

```json
{
  "permissions": [
    "read:content",    // Read content
    "write:content",   // Create/update content
    "delete:content",  // Delete content
    "read:users",      // Read user data
    "write:users",     // Create/update users
    "delete:users",    // Delete users
    "read:files",      // Read files
    "write:files",     // Upload files
    "delete:files",    // Delete files
    "read:settings",   // Read settings
    "write:settings",  // Update settings
    "read:analytics",  // Read analytics
    "write:analytics", // Write analytics
    "system:admin",    // Admin access
    "system:debug"     // Debug access
  ]
}
```

### Sandbox Environment

Plugins run in a sandboxed environment with limited access:

```javascript
// Available in sandbox
console.log('Plugin logging');
Buffer.from('data');
crypto.randomBytes(16);
path.join('a', 'b');
fs.readFile('file.txt');
JSON.parse('{}');
new Date();
Math.random();
new RegExp('pattern');

// NOT available in sandbox
process.exit();
require('fs').writeFileSync();
eval('code');
```

### Input Validation

Always validate and sanitize input:

```javascript
// Validate input
const schema = {
  name: 'string',
  email: 'string',
  age: 'number'
};

if (!this.api.validateInput(data, schema)) {
  throw new Error('Invalid input data');
}

// Sanitize input
const sanitized = this.api.sanitizeInput(userInput);
```

## Database Integration

### Creating Tables

Define database tables in your manifest:

```json
{
  "database": {
    "tables": [
      {
        "name": "my_plugin_data",
        "columns": [
          {
            "name": "id",
            "type": "integer",
            "primary": true,
            "autoIncrement": true
          },
          {
            "name": "user_id",
            "type": "integer",
            "references": "beam_users.id"
          },
          {
            "name": "data",
            "type": "text"
          },
          {
            "name": "created_at",
            "type": "datetime",
            "default": "CURRENT_TIMESTAMP"
          }
        ]
      }
    ]
  }
}
```

### Using Database in Plugin

```javascript
class MyPlugin {
  async setupDatabase() {
    const db = new this.api.database();
    await db.connect();
    
    // Check if table exists
    const tableExists = await db.db.schema.hasTable('my_plugin_data');
    if (!tableExists) {
      await db.db.schema.createTable('my_plugin_data', (table) => {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('beam_users');
        table.text('data');
        table.timestamp('created_at').defaultTo(db.db.fn.now());
      });
    }
  }
  
  async storeData(userId, data) {
    const db = new this.api.database();
    await db.connect();
    
    const result = await db.db('my_plugin_data').insert({
      user_id: userId,
      data: JSON.stringify(data)
    });
    
    return result[0];
  }
}
```

### Migrations

Create database migrations for version updates:

```javascript
// migrations/1.0.1-up.js
module.exports = async function up(knex) {
  await knex.schema.alterTable('my_plugin_data', (table) => {
    table.string('status').defaultTo('active');
  });
};

// migrations/1.0.1-down.js
module.exports = async function down(knex) {
  await knex.schema.alterTable('my_plugin_data', (table) => {
    table.dropColumn('status');
  });
};
```

## Configuration Management

### Configuration Schema

Define configuration options in your manifest:

```json
{
  "configSchema": {
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Enable the plugin"
    },
    "apiKey": {
      "type": "string",
      "default": "",
      "description": "API key for external service",
      "secret": true
    },
    "maxRequests": {
      "type": "number",
      "default": 100,
      "description": "Maximum requests per minute",
      "min": 1,
      "max": 1000
    },
    "features": {
      "type": "object",
      "default": {
        "feature1": true,
        "feature2": false
      },
      "description": "Feature flags"
    }
  }
}
```

### Loading Configuration

```javascript
class MyPlugin {
  async loadConfig() {
    try {
      const config = await this.api.getSetting('my-plugin:config', {});
      return {
        enabled: config.enabled !== undefined ? config.enabled : true,
        apiKey: config.apiKey || '',
        maxRequests: config.maxRequests || 100,
        features: config.features || {
          feature1: true,
          feature2: false
        }
      };
    } catch (error) {
      this.logger.error('Failed to load config', { error: error.message });
      return this.getDefaultConfig();
    }
  }
  
  async saveConfig(config) {
    try {
      await this.api.setSetting('my-plugin:config', config, 'object');
      this.config = { ...this.config, ...config };
      this.logger.info('Configuration saved', { config });
    } catch (error) {
      this.logger.error('Failed to save config', { error: error.message });
      throw error;
    }
  }
}
```

## Health Monitoring

### Health Check Implementation

```javascript
class MyPlugin {
  async healthCheck() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: this.metrics,
        cache: {
          size: this.cache.size,
          keys: Array.from(this.cache.keys())
        },
        config: {
          enabled: this.config.enabled,
          features: Object.keys(this.config.features || {})
        }
      };

      // Check if plugin is responding
      if (this.config.enabled === false) {
        health.status = 'disabled';
      }

      // Check for recent errors
      if (this.metrics.errors > 10) {
        health.status = 'warning';
        health.warnings = ['High error rate detected'];
      }

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
```

### Metrics Tracking

```javascript
class MyPlugin {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      lastRequest: null,
      responseTime: []
    };
  }
  
  trackRequest() {
    this.metrics.requests++;
    this.metrics.lastRequest = new Date();
  }
  
  trackError() {
    this.metrics.errors++;
  }
  
  trackResponseTime(time) {
    this.metrics.responseTime.push(time);
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }
  }
}
```

## Testing

### Unit Testing

```javascript
// tests/plugin.test.js
const MyPlugin = require('../index.js');

describe('MyPlugin', () => {
  let plugin;
  let mockApi;

  beforeEach(() => {
    mockApi = {
      logger: { info: jest.fn(), error: jest.fn() },
      getSetting: jest.fn(),
      setSetting: jest.fn(),
      trackEvent: jest.fn()
    };
    
    plugin = new MyPlugin();
  });

  test('should initialize correctly', async () => {
    await plugin.initialize(mockApi);
    expect(plugin.api).toBe(mockApi);
  });

  test('should handle content creation', async () => {
    await plugin.initialize(mockApi);
    
    const result = await plugin.onContentCreate({
      id: 1,
      title: 'Test Content',
      type: 'post'
    });
    
    expect(result.success).toBe(true);
    expect(mockApi.trackEvent).toHaveBeenCalledWith('content_created', expect.any(Object));
  });
});
```

### Integration Testing

```javascript
// tests/integration.test.js
const BeamPluginManager = require('../../src/plugins/BeamPluginManager');

describe('Plugin Integration', () => {
  let pluginManager;

  beforeEach(async () => {
    pluginManager = new BeamPluginManager();
    await pluginManager.initialize();
  });

  test('should install and activate plugin', async () => {
    const result = await pluginManager.installPlugin('./plugins/my-plugin');
    expect(result.success).toBe(true);
    
    const activation = await pluginManager.activatePlugin('my-plugin');
    expect(activation.success).toBe(true);
  });
});
```

## Deployment

### Plugin Package

Create a distributable package:

```bash
# Create plugin package
tar -czf my-plugin-1.0.0.tar.gz my-plugin/

# Or use npm
npm pack
```

### Installation

```bash
# Install from file
npm run plugin:install ./my-plugin-1.0.0.tar.gz

# Install from URL
npm run plugin:install https://example.com/my-plugin-1.0.0.tar.gz

# Install from repository
npm run plugin:install my-plugin@1.0.0
```

### Updates

```bash
# Update plugin
npm run plugin:update my-plugin

# Check for updates
npm run plugin:check-updates
```

## Best Practices

### 1. Error Handling

```javascript
class MyPlugin {
  async onContentCreate(data) {
    try {
      // Plugin logic
      return { success: true };
    } catch (error) {
      this.logger.error('Plugin error', { 
        error: error.message,
        stack: error.stack,
        data 
      });
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Resource Management

```javascript
class MyPlugin {
  constructor() {
    this.cache = new Map();
    this.intervals = [];
  }
  
  async cleanup() {
    // Clear cache
    this.cache.clear();
    
    // Clear intervals
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    
    // Close database connections
    if (this.db) {
      await this.db.destroy();
    }
  }
}
```

### 3. Configuration Validation

```javascript
class MyPlugin {
  validateConfig(config) {
    const errors = [];
    
    if (config.apiKey && config.apiKey.length < 10) {
      errors.push('API key must be at least 10 characters');
    }
    
    if (config.maxRequests < 1 || config.maxRequests > 1000) {
      errors.push('Max requests must be between 1 and 1000');
    }
    
    return errors;
  }
}
```

### 4. Logging

```javascript
class MyPlugin {
  async onContentCreate(data) {
    this.logger.info('Processing content creation', {
      contentId: data.id,
      type: data.type,
      userId: data.user_id
    });
    
    // Process content
    
    this.logger.info('Content creation processed', {
      contentId: data.id,
      success: true
    });
  }
}
```

### 5. Performance

```javascript
class MyPlugin {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 3600; // 1 hour
  }
  
  async getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    const data = await this.fetchData(key);
    this.cache.set(key, {
      data,
      expires: Date.now() + (this.cacheTTL * 1000)
    });
    
    return data;
  }
}
```

### 6. Security

```javascript
class MyPlugin {
  async validateInput(data) {
    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Name is required and must be a string');
    }
    
    // Sanitize input
    data.name = this.api.sanitizeInput(data.name);
    
    // Check permissions
    if (!this.hasPermission('write:content')) {
      throw new Error('Insufficient permissions');
    }
    
    return data;
  }
}
```

This guide covers all aspects of plugin development for the Beam Website System. Follow these practices to create secure, reliable, and maintainable plugins.

# BeamFlow Plugin Development Standards

##  **Overview**

This document defines the standards and best practices for developing plugins in the BeamFlow system. All plugins must follow these standards to ensure consistency, security, and maintainability.

##  **Plugin Structure**

### Required Files
```
plugin-name/
├── plugin.yaml          # Plugin manifest (required)
├── index.js            # Main plugin file (required)
├── README.md           # Plugin documentation (required)
├── package.json        # Dependencies (if needed)
├── assets/             # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── components/         # UI components
├── pages/             # Custom pages
├── api/               # API endpoints
├── data/              # Plugin data (auto-created)
└── logs/              # Plugin logs (auto-created)
```

### Plugin Manifest (plugin.yaml)
```yaml
name: "plugin-name"
version: "1.0.0"
description: "Plugin description"
author: "Author Name"
license: "MIT"
dependencies: []
permissions: []

settings:
  setting_name:
    type: "string|number|boolean|select"
    default: "default_value"
    required: false
    description: "Setting description"
    validation: "regex_or_function"
    options: ["option1", "option2"]  # For select type

hooks:
  - name: "onRequest"
    description: "Hook description"
    priority: 0
    enabled: true

ui:
  navigation:
    enabled: true
    title: "Plugin Title"
    icon: "extension"
    path: "/plugins/plugin-name"
    order: 100
    permissions: []
  
  widgets:
    - name: "WidgetName"
      description: "Widget description"
      component: "WidgetComponent"
      permissions: []
  
  pages:
    - name: "PageName"
      description: "Page description"
      component: "PageComponent"
      path: "/plugins/plugin-name/page"
      permissions: []

api:
  routes:
    - method: "GET"
      path: "/data"
      handler: "getData"
      middleware: []
      permissions: []
  
  websocket:
    - event: "message"
      handler: "handleMessage"
      permissions: []
  
  middleware: []
  rateLimit:
    windowMs: 900000
    max: 100
```

##  **Plugin Template Usage**

### Basic Plugin Structure
```javascript
const PluginTemplate = require('./templates/PluginTemplate');

class MyPlugin extends PluginTemplate {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'My awesome plugin',
            author: 'Your Name',
            license: 'MIT',
            
            // Settings schema
            settings: {
                apiKey: {
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'API key for external service',
                    validation: (value) => value.length > 0
                },
                enabled: {
                    type: 'boolean',
                    default: true,
                    description: 'Enable plugin functionality'
                }
            },
            
            // Hooks
            hooks: [
                {
                    name: 'onRequest',
                    description: 'Process incoming requests',
                    priority: 0,
                    handler: this.handleRequest.bind(this)
                }
            ],
            
            // UI configuration
            ui: {
                navigation: {
                    enabled: true,
                    title: 'My Plugin',
                    icon: 'extension',
                    path: '/plugins/my-plugin',
                    order: 100
                },
                widgets: [
                    {
                        name: 'MyWidget',
                        description: 'My custom widget',
                        component: 'MyWidgetComponent'
                    }
                ]
            },
            
            // API configuration
            api: {
                routes: [
                    {
                        method: 'GET',
                        path: '/data',
                        handler: this.getData.bind(this),
                        permissions: ['read']
                    }
                ]
            }
        });
    }
    
    // Override lifecycle methods
    async onInit(context) {
        // Plugin-specific initialization
        this.log('info', 'My plugin initialized');
    }
    
    async onEnable() {
        // Plugin-specific enable logic
        this.log('info', 'My plugin enabled');
    }
    
    async onDisable() {
        // Plugin-specific disable logic
        this.log('info', 'My plugin disabled');
    }
    
    // Hook handlers
    async handleRequest(req, res, next) {
        // Process request
        this.metrics.requestCount++;
        next();
    }
    
    // API handlers
    async getData(req, res) {
        try {
            const data = await this.fetchData();
            res.json({ success: true, data });
        } catch (error) {
            this.error('Failed to fetch data', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
    
    // Plugin-specific methods
    async fetchData() {
        // Implementation
    }
}

module.exports = MyPlugin;
```

##  **UI Development Standards**

### Widget Components
```javascript
class MyWidget {
    constructor() {
        this.name = 'MyWidget';
        this.description = 'My custom widget';
        this.version = '1.0.0';
    }
    
    getHTML(data = {}) {
        return `
            <div class="my-widget">
                <h3>My Widget</h3>
                <div class="widget-content">
                    ${this.renderContent(data)}
                </div>
            </div>
        `;
    }
    
    getCSS() {
        return `
            .my-widget {
                background: white;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        `;
    }
    
    renderContent(data) {
        return `<p>Widget content: ${data.message || 'No data'}</p>`;
    }
}
```

### Page Components
```javascript
class MyPage {
    constructor() {
        this.name = 'MyPage';
        this.description = 'My custom page';
        this.path = '/plugins/my-plugin/page';
    }
    
    getHTML(data = {}) {
        return `
            <div class="my-page">
                <header class="page-header">
                    <h1>My Plugin Page</h1>
                </header>
                <main class="page-content">
                    ${this.renderContent(data)}
                </main>
            </div>
        `;
    }
    
    getCSS() {
        return `
            .my-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 24px;
            }
        `;
    }
}
```

##  **API Development Standards**

### REST API Routes
```javascript
// GET endpoint
async getData(req, res) {
    try {
        // Validate permissions
        if (!this.hasPermission(req.user, 'read')) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        // Process request
        const data = await this.fetchData();
        
        // Log activity
        this.log('info', 'Data fetched', { user: req.user.id });
        
        res.json({ success: true, data });
    } catch (error) {
        this.error('API error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// POST endpoint
async createData(req, res) {
    try {
        // Validate input
        const { name, value } = req.body;
        if (!name || !value) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create data
        const result = await this.createData({ name, value });
        
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        this.error('Create data error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
```

### WebSocket Events
```javascript
async handleWebSocketMessage(socket, data) {
    try {
        // Validate user
        if (!socket.user) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
        }
        
        // Process message
        const result = await this.processMessage(data);
        
        // Broadcast to other users
        socket.broadcast.emit('message', result);
        
    } catch (error) {
        this.error('WebSocket error', error);
        socket.emit('error', { message: 'Internal error' });
    }
}
```

##  **Security Standards**

### Permission System
```javascript
// Define permissions in plugin.yaml
permissions:
  - "plugin:my-plugin:read"
  - "plugin:my-plugin:write"
  - "plugin:my-plugin:admin"

// Check permissions in code
hasPermission(user, permission) {
    return user.permissions.includes(permission);
}

// Validate in API handlers
async getData(req, res) {
    if (!this.hasPermission(req.user, 'plugin:my-plugin:read')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    // ... rest of handler
}
```

### Input Validation
```javascript
// Validate settings
settings: {
    apiKey: {
        type: 'string',
        validation: (value) => {
            return value.length >= 32 && /^[a-zA-Z0-9]+$/.test(value);
        }
    },
    port: {
        type: 'number',
        validation: (value) => {
            return value >= 1 && value <= 65535;
        }
    }
}

// Validate API input
async createData(req, res) {
    const { name, value } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Invalid name' });
    }
    
    // Validate length
    if (name.length > 100) {
        return res.status(400).json({ error: 'Name too long' });
    }
    
    // Sanitize input
    const sanitizedName = this.sanitizeString(name);
    
    // ... rest of handler
}
```

##  **Performance Standards**

### Caching
```javascript
// Use cache for expensive operations
async getData() {
    const cacheKey = `plugin:${this.name}:data`;
    
    // Check cache first
    let data = await this.cache.get(cacheKey);
    if (data) {
        return data;
    }
    
    // Fetch from source
    data = await this.fetchFromSource();
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, data, 300);
    
    return data;
}
```

### Database Optimization
```javascript
// Use indexes for frequently queried fields
async initializeDatabase() {
    await this.database.run(`
        CREATE TABLE IF NOT EXISTS plugin_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Create indexes
    await this.database.run(`
        CREATE INDEX IF NOT EXISTS idx_plugin_data_name 
        ON plugin_data(name)
    `);
}
```

##  **Testing Standards**

### Unit Tests
```javascript
// test/plugin.test.js
const MyPlugin = require('../index');

describe('MyPlugin', () => {
    let plugin;
    
    beforeEach(() => {
        plugin = new MyPlugin();
    });
    
    test('should initialize correctly', async () => {
        const result = await plugin.init({});
        expect(result).toBe(true);
        expect(plugin.isInitialized).toBe(true);
    });
    
    test('should validate settings', () => {
        expect(() => plugin.updateSetting('invalid', 'value'))
            .toThrow('Setting \'invalid\' does not exist');
    });
});
```

### Integration Tests
```javascript
// test/integration.test.js
describe('Plugin API', () => {
    test('should return data', async () => {
        const response = await request(app)
            .get('/api/plugins/my-plugin/data')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
```

##  **Documentation Standards**

### README.md Template
```markdown
# Plugin Name

Brief description of what the plugin does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

1. Copy plugin to `plugins/` directory
2. Enable plugin in admin panel
3. Configure settings

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| apiKey | string | "" | API key for external service |
| enabled | boolean | true | Enable plugin functionality |

## API Endpoints

### GET /api/plugins/plugin-name/data
Returns plugin data.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

## Hooks

### onRequest
Processes incoming requests.

## Permissions

- `plugin:plugin-name:read` - Read plugin data
- `plugin:plugin-name:write` - Write plugin data
- `plugin:plugin-name:admin` - Admin access

## Development

```bash
npm install
npm test
```

## License

MIT
```

##  **Deployment Standards**

### Plugin Packaging
```javascript
// package.json
{
  "name": "beamflow-plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "build": "webpack --mode production",
    "lint": "eslint ."
  },
  "dependencies": {
    "required-package": "^1.0.0"
  },
  "devDependencies": {
    "jest": "^27.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Version Management
```javascript
// Follow semantic versioning
// MAJOR.MINOR.PATCH
// 1.0.0 - Initial release
// 1.1.0 - New features
// 1.1.1 - Bug fixes
```

##  **Update Standards**

### Backward Compatibility
```javascript
// Always maintain backward compatibility
// Use feature flags for new features
settings: {
    useNewFeature: {
        type: 'boolean',
        default: false,
        description: 'Enable new feature (experimental)'
    }
}

// Check feature flag in code
if (this.getSetting('useNewFeature')) {
    // New implementation
} else {
    // Old implementation
}
```

### Migration Scripts
```javascript
async migrateSettings(fromVersion, toVersion) {
    if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
        // Migrate settings from 1.0.0 to 1.1.0
        const oldSetting = this.settings.oldSetting?.value;
        if (oldSetting) {
            await this.updateSetting('newSetting', oldSetting);
        }
    }
}
```

##  **Checklist**

Before submitting a plugin, ensure:

- [ ] Plugin follows template structure
- [ ] All required files are present
- [ ] Settings are properly validated
- [ ] Permissions are correctly defined
- [ ] API endpoints are secure
- [ ] Error handling is implemented
- [ ] Logging is comprehensive
- [ ] Tests are written and passing
- [ ] Documentation is complete
- [ ] Performance is optimized
- [ ] Security measures are in place
- [ ] Backward compatibility is maintained

##  **Support**

For plugin development support:

1. Check the plugin template examples
2. Review existing plugins in the repository
3. Consult the API documentation
4. Join the developer community
5. Submit issues for bugs or feature requests

---

**Remember**: These standards ensure consistency, security, and maintainability across all plugins in the BeamFlow ecosystem.

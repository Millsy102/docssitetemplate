# BeamFlow Plugin System

##  **Overview**

The BeamFlow Plugin System provides a powerful, standardized way to extend your private system with new features, UI components, and functionality. All plugins follow professional development standards and integrate seamlessly with the core system.

##  **Architecture**

### Plugin Structure
```
plugins/
├── templates/
│   └── PluginTemplate.js          # Base plugin template
├── installed/
│   ├── active/                    # Enabled plugins
│   │   ├── real-time-chat/        # Example plugin
│   │   └── other-plugins/
│   └── inactive/                  # Disabled plugins
├── marketplace/                   # Available plugins
└── PLUGIN_STANDARDS.md           # Development standards
```

### Core Components
- **PluginTemplate**: Base class for all plugins
- **PluginManager**: Manages plugin lifecycle and loading
- **Hook System**: Event-driven plugin integration
- **UI Manager**: Widget and page management
- **API Router**: Plugin API endpoint handling

##  **Quick Start**

### 1. Create a New Plugin

```bash
# Navigate to plugins directory
cd _internal/system/src/plugins/installed/active

# Create plugin directory
mkdir my-awesome-plugin
cd my-awesome-plugin
```

### 2. Create Plugin Manifest

Create `plugin.yaml`:

```yaml
name: "my-awesome-plugin"
version: "1.0.0"
description: "My awesome plugin description"
author: "Your Name"
license: "MIT"
dependencies: []
permissions: 
  - "plugin:my-awesome-plugin:read"
  - "plugin:my-awesome-plugin:write"

settings:
  api_key:
    type: "string"
    default: ""
    required: true
    description: "API key for external service"
  
  enabled:
    type: "boolean"
    default: true
    description: "Enable plugin functionality"

hooks:
  - name: "onRequest"
    description: "Process incoming requests"
    priority: 0
    enabled: true

ui:
  navigation:
    enabled: true
    title: "My Plugin"
    icon: "extension"
    path: "/plugins/my-awesome-plugin"
    order: 100
    permissions: ["plugin:my-awesome-plugin:read"]
  
  widgets:
    - name: "MyWidget"
      description: "My custom widget"
      component: "MyWidget"
      permissions: ["plugin:my-awesome-plugin:read"]

api:
  routes:
    - method: "GET"
      path: "/data"
      handler: "getData"
      middleware: ["auth"]
      permissions: ["plugin:my-awesome-plugin:read"]
```

### 3. Create Main Plugin File

Create `index.js`:

```javascript
const PluginTemplate = require('../../templates/PluginTemplate');

class MyAwesomePlugin extends PluginTemplate {
    constructor() {
        super({
            name: 'my-awesome-plugin',
            version: '1.0.0',
            description: 'My awesome plugin description',
            author: 'Your Name',
            license: 'MIT',
            dependencies: [],
            permissions: [
                'plugin:my-awesome-plugin:read',
                'plugin:my-awesome-plugin:write'
            ],
            
            // Settings schema
            settings: {
                api_key: {
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
                    path: '/plugins/my-awesome-plugin',
                    order: 100,
                    permissions: ['plugin:my-awesome-plugin:read']
                },
                widgets: [
                    {
                        name: 'MyWidget',
                        description: 'My custom widget',
                        component: 'MyWidget',
                        permissions: ['plugin:my-awesome-plugin:read']
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
                        middleware: ['auth'],
                        permissions: ['plugin:my-awesome-plugin:read']
                    }
                ]
            }
        });
    }
    
    // Override lifecycle methods
    async onInit(context) {
        this.log('info', 'My plugin initialized');
    }
    
    async onEnable() {
        this.log('info', 'My plugin enabled');
    }
    
    async onDisable() {
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
        return { message: 'Hello from my plugin!' };
    }
}

module.exports = MyAwesomePlugin;
```

### 4. Create Widget Component

Create `components/MyWidget.js`:

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
                    <p>Widget content: ${data.message || 'No data'}</p>
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
            
            .my-widget h3 {
                margin: 0 0 12px 0;
                color: #333;
            }
            
            .widget-content {
                color: #666;
            }
        `;
    }
}

module.exports = MyWidget;
```

### 5. Create README

Create `README.md`:

```markdown
# My Awesome Plugin

Brief description of what the plugin does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

1. Copy plugin to `plugins/installed/active/` directory
2. Enable plugin in admin panel
3. Configure settings

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| apiKey | string | "" | API key for external service |
| enabled | boolean | true | Enable plugin functionality |

## API Endpoints

### GET /api/plugins/my-awesome-plugin/data
Returns plugin data.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Hello from my plugin!"
  }
}
```

## Permissions

- `plugin:my-awesome-plugin:read` - Read plugin data
- `plugin:my-awesome-plugin:write` - Write plugin data

## License

MIT
```

##  **Plugin Management**

### Enable/Disable Plugins

Plugins can be managed through the admin dashboard:

1. Navigate to `/admin/plugins`
2. Find your plugin in the list
3. Click "Enable" or "Disable"

### Plugin Settings

Configure plugin settings:

1. Go to `/admin/plugins/settings`
2. Select your plugin
3. Modify settings
4. Save changes

### Plugin Updates

Update plugins safely:

1. Backup current plugin
2. Replace plugin files
3. Restart the system
4. Check for compatibility

##  **UI Development**

### Creating Widgets

Widgets are modular UI components that can be placed on dashboards:

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

### Creating Pages

Pages are full-page interfaces for your plugin:

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

##  **API Development**

### REST API Routes

Create API endpoints for your plugin:

```javascript
// GET endpoint
async getData(req, res) {
    try {
        // Validate permissions
        if (!this.hasPermission(req.user, 'plugin:my-plugin:read')) {
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

Handle real-time communication:

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

##  **Security**

### Permission System

Define and check permissions:

```javascript
// In plugin.yaml
permissions: 
  - "plugin:my-plugin:read"
  - "plugin:my-plugin:write"
  - "plugin:my-plugin:admin"

// In code
hasPermission(user, permission) {
    return user.permissions && user.permissions.includes(permission);
}

// Check in API handlers
async getData(req, res) {
    if (!this.hasPermission(req.user, 'plugin:my-plugin:read')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    // ... rest of handler
}
```

### Input Validation

Validate all inputs:

```javascript
// Validate settings
settings: {
    apiKey: {
        type: 'string',
        validation: (value) => {
            return value.length >= 32 && /^[a-zA-Z0-9]+$/.test(value);
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

##  **Performance**

### Caching

Use caching for expensive operations:

```javascript
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

Optimize database operations:

```javascript
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

##  **Testing**

### Unit Tests

Test your plugin functionality:

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

Test API endpoints:

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

##  **Documentation**

### Required Documentation

Every plugin must include:

1. **README.md** - Plugin overview and usage
2. **API Documentation** - Endpoint descriptions
3. **Configuration Guide** - Settings explanation
4. **Installation Instructions** - Setup steps

### Documentation Standards

- Use clear, concise language
- Include code examples
- Document all settings and permissions
- Provide troubleshooting guides

##  **Deployment**

### Plugin Packaging

Package your plugin for distribution:

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

Follow semantic versioning:

- **MAJOR** - Breaking changes
- **MINOR** - New features
- **PATCH** - Bug fixes

##  **Updates**

### Backward Compatibility

Maintain backward compatibility:

```javascript
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

Handle settings migrations:

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

##  **Examples**

### Real-Time Chat Plugin

See `installed/active/real-time-chat/` for a complete example plugin that includes:

- Real-time messaging with WebSocket
- File upload functionality
- Multiple chat rooms
- Message moderation
- User management
- Statistics and analytics

### Widget Examples

- **SystemStatusWidget** - System monitoring
- **FileManagerWidget** - File management
- **AnalyticsDashboardWidget** - Data visualization
- **UserManagementWidget** - User administration
- **NotificationCenterWidget** - Notification system

##  **Best Practices**

1. **Follow Standards** - Always use the PluginTemplate
2. **Security First** - Validate all inputs and check permissions
3. **Error Handling** - Implement comprehensive error handling
4. **Logging** - Log important events and errors
5. **Performance** - Optimize for speed and efficiency
6. **Testing** - Write tests for all functionality
7. **Documentation** - Document everything clearly
8. **Updates** - Maintain backward compatibility

---

**Remember**: These standards ensure consistency, security, and maintainability across all plugins in the BeamFlow ecosystem.

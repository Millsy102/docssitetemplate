# Beam Plugin Organization Guide

## Overview

This guide explains the proper organization of the Beam system's plugin architecture, distinguishing between **core features** and **third-party plugins**.

## Directory Structure

```
beam-website/
├── src/
│   ├── features/                    # Core website features
│   │   ├── BeamAIChat/             # AI Chat feature
│   │   │   ├── index.js            # Feature entry point
│   │   │   ├── routes.js           # Feature routes
│   │   │   ├── service.js          # Feature service
│   │   │   └── ui.js               # Feature UI components
│   │   ├── BeamAnalytics/          # Analytics feature
│   │   └── BeamContent/            # Content management feature
│   ├── plugins/                     # Plugin system infrastructure
│   │   ├── BeamPluginSystem.js     # Plugin system manager
│   │   ├── BeamPluginManager.js    # Plugin lifecycle manager
│   │   ├── BeamPluginBase.js       # Base class for plugins
│   │   └── installed/              # Installed third-party plugins
│   │       └── openai-image-generator/
│   └── routes/                      # Legacy routes (to be moved)
├── plugins/                         # Third-party plugins directory
│   ├── beam-seo-plugin/            # SEO plugin
│   │   ├── index.js                # Plugin entry point
│   │   ├── manifest.json           # Plugin manifest
│   │   ├── routes.js               # Plugin routes
│   │   ├── ui.js                   # Plugin UI
│   │   ├── admin.html              # Admin interface
│   │   ├── styles.css              # Plugin styles
│   │   └── scripts.js              # Plugin scripts
│   └── beam-backup-plugin/         # Backup plugin
└── docs/                           # Documentation
```

## Core Features vs Third-Party Plugins

### Core Features (`src/features/`)

**Core features** are essential website functionality that is part of the main system:

- **BeamAIChat** - AI chat functionality
- **BeamAnalytics** - Website analytics
- **BeamContent** - Content management
- **BeamAuth** - Authentication system
- **BeamAdmin** - Admin panel

**Characteristics:**
- Part of the main website system
- Cannot be disabled or removed
- Follow Beam naming conventions
- Integrated with core services
- No plugin manifest required

**Structure:**
```
src/features/BeamFeatureName/
├── index.js        # Feature entry point
├── routes.js       # Feature API routes
├── service.js      # Feature business logic
├── ui.js           # Feature UI components
└── styles.css      # Feature styles (optional)
```

### Third-Party Plugins (`plugins/`)

**Third-party plugins** are optional, extensible functionality:

- **beam-seo-plugin** - SEO optimization
- **beam-backup-plugin** - Automated backups
- **beam-social-plugin** - Social media integration
- **beam-payment-plugin** - Payment processing

**Characteristics:**
- Optional and removable
- Follow plugin naming conventions
- Require manifest.json
- Can be enabled/disabled
- Isolated from core system

**Structure:**
```
plugins/plugin-name/
├── index.js        # Plugin entry point
├── manifest.json   # Plugin configuration
├── routes.js       # Plugin API routes
├── ui.js           # Plugin UI components
├── admin.html      # Admin interface
├── frontend.html   # Frontend interface
├── styles.css      # Plugin styles
├── scripts.js      # Plugin scripts
└── assets/         # Plugin assets
```

## Plugin System Infrastructure

### BeamPluginBase (`src/plugins/BeamPluginBase.js`)

Base class that all third-party plugins must extend:

```javascript
const BeamPluginBase = require('../../src/plugins/BeamPluginBase');

class MyPlugin extends BeamPluginBase {
    constructor() {
        super({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'My plugin description',
            author: 'Plugin Author',
            category: 'utility',
            dependencies: ['database', 'auth'],
            capabilities: ['feature1', 'feature2']
        });
    }

    async onInitialize() {
        // Plugin initialization logic
    }

    async handleAIChatCommand(message, userId) {
        // AI chat integration
    }
}
```

### Plugin Manifest (`manifest.json`)

Required configuration file for all third-party plugins:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Plugin Author",
  "license": "MIT",
  "main": "index.js",
  "category": "utility",
  "type": "plugin",
  "dependencies": {
    "database": "required",
    "auth": "optional"
  },
  "capabilities": [
    "feature1",
    "feature2"
  ],
  "commands": [
    {
      "name": "command_name",
      "trigger": "trigger phrase",
      "description": "Command description"
    }
  ],
  "routes": [
    {
      "path": "/api/plugins/plugin/action",
      "method": "POST",
      "description": "Route description"
    }
  ],
  "ui": {
    "admin": "admin.html",
    "frontend": "frontend.html",
    "styles": "styles.css",
    "scripts": "scripts.js"
  },
  "settings": {
    "setting_name": {
      "type": "boolean",
      "default": false,
      "description": "Setting description"
    }
  },
  "permissions": [
    "read_data",
    "write_data"
  ]
}
```

## Migration Guide

### Moving Core Features

1. **Create feature directory:**
   ```bash
   mkdir -p src/features/BeamFeatureName
   ```

2. **Move existing files:**
   ```bash
   mv src/routes/BeamFeatureRoutes.js src/features/BeamFeatureName/routes.js
   ```

3. **Create feature entry point:**
   ```javascript
   // src/features/BeamFeatureName/index.js
   const BeamFeatureRoutes = require('./routes');
   const BeamFeatureService = require('./service');
   const BeamFeatureUI = require('./ui');

   class BeamFeature {
       constructor() {
           this.routes = BeamFeatureRoutes;
           this.service = new BeamFeatureService();
           this.ui = new BeamFeatureUI();
       }

       async initialize() {
           await this.service.initialize();
       }

       getRoutes() {
           return this.routes;
       }

       getInfo() {
           return {
               name: 'Beam Feature',
               version: '1.0.0',
               type: 'core-feature'
           };
       }
   }

   module.exports = new BeamFeature();
   ```

4. **Update server imports:**
   ```javascript
   // src/server.js
   const BeamFeature = require('./features/BeamFeatureName');
   
   // Initialize feature
   await BeamFeature.initialize();
   
   // Use feature routes
   app.use('/api/feature', BeamFeature.getRoutes());
   ```

### Creating Third-Party Plugins

1. **Create plugin directory:**
   ```bash
   mkdir -p plugins/plugin-name
   ```

2. **Create plugin structure:**
   ```
   plugins/plugin-name/
   ├── index.js
   ├── manifest.json
   ├── routes.js
   ├── ui.js
   ├── admin.html
   ├── styles.css
   └── scripts.js
   ```

3. **Extend BeamPluginBase:**
   ```javascript
   // plugins/plugin-name/index.js
   const BeamPluginBase = require('../../src/plugins/BeamPluginBase');

   class MyPlugin extends BeamPluginBase {
       constructor() {
           super({
               name: 'my-plugin',
               version: '1.0.0',
               description: 'My plugin description',
               author: 'Plugin Author',
               category: 'utility'
           });
       }

       async onInitialize() {
           // Plugin initialization
       }
   }

   module.exports = new MyPlugin();
   ```

4. **Create manifest:**
   ```json
   // plugins/plugin-name/manifest.json
   {
     "name": "my-plugin",
     "version": "1.0.0",
     "description": "My plugin description",
     "author": "Plugin Author",
     "license": "MIT",
     "main": "index.js",
     "category": "utility",
     "type": "plugin"
   }
   ```

## Plugin Lifecycle

### 1. Discovery
- Plugin system scans `plugins/` directory
- Reads `manifest.json` files
- Validates plugin configuration

### 2. Loading
- Loads plugin entry point (`index.js`)
- Validates plugin extends `BeamPluginBase`
- Checks dependencies

### 3. Initialization
- Calls `plugin.initialize()`
- Sets up database tables
- Loads plugin settings
- Registers routes and UI

### 4. Activation
- Plugin can be enabled/disabled
- Enabled plugins are active in system
- Disabled plugins are inactive but loaded

### 5. Cleanup
- Plugin resources are cleaned up
- Database connections closed
- Temporary files removed

## Best Practices

### Core Features
- Use descriptive, Beam-prefixed names
- Keep features modular and focused
- Integrate with core services
- Follow established patterns
- Include comprehensive documentation

### Third-Party Plugins
- Use descriptive, lowercase names with hyphens
- Include complete manifest.json
- Implement all required methods
- Handle errors gracefully
- Provide clear documentation
- Test thoroughly before distribution

### Plugin Development
- Extend `BeamPluginBase` class
- Implement required lifecycle methods
- Use plugin settings for configuration
- Log events and errors appropriately
- Follow security best practices
- Provide clear user interfaces

## Security Considerations

### Plugin Isolation
- Plugins run in isolated context
- Limited access to system resources
- Permission-based access control
- Sandboxed execution environment

### Data Protection
- Validate all plugin inputs
- Sanitize plugin outputs
- Use parameterized queries
- Implement proper authentication

### Error Handling
- Catch and log all errors
- Prevent plugin crashes
- Graceful degradation
- User-friendly error messages

## Testing

### Core Features
- Unit tests for each component
- Integration tests for features
- End-to-end testing
- Performance testing

### Third-Party Plugins
- Plugin validation tests
- Functionality tests
- Security tests
- Compatibility tests
- User acceptance testing

## Deployment

### Core Features
- Deployed with main system
- No separate deployment needed
- Version controlled with main codebase

### Third-Party Plugins
- Can be deployed independently
- Version controlled separately
- Distribution through plugin repository
- Automatic updates possible

## Troubleshooting

### Common Issues
1. **Plugin not loading:** Check manifest.json syntax
2. **Dependency errors:** Verify required services available
3. **Permission denied:** Check plugin permissions
4. **UI not displaying:** Verify UI files exist and are accessible

### Debug Mode
Enable debug logging:
```bash
export BEAM_DEBUG=true
```

### Plugin Logs
View plugin logs:
```javascript
const logs = await plugin.getLogs(100);
console.log(logs);
```

## Conclusion

This organization provides a clear separation between core website features and extensible third-party plugins, making the system more maintainable, secure, and scalable. Core features provide essential functionality, while third-party plugins enable customization and extension without affecting the main system.

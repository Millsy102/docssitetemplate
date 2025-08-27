# BeamFlow Plugin Sandboxing System

## Overview

The BeamFlow Plugin Sandboxing System provides comprehensive security isolation for plugins, ensuring that they cannot access unauthorized system resources or perform malicious operations. This system implements multiple layers of security including code validation, resource limits, permission controls, and runtime isolation.

## Security Features

### 1. Code Validation
- **Static Analysis**: Pre-execution code scanning for dangerous patterns
- **Module Restrictions**: Blocked access to sensitive Node.js modules
- **Pattern Detection**: Identification of malicious code patterns
- **Permission-Based Validation**: Code validation based on plugin permissions

### 2. Runtime Isolation
- **VM Sandboxing**: Execution in isolated Node.js VM contexts
- **Context Separation**: Complete isolation between plugin and host environment
- **Safe APIs**: Controlled access to system resources through safe APIs
- **Error Containment**: Plugin errors cannot affect the main application

### 3. Resource Limits
- **Memory Limits**: Maximum memory usage per plugin (default: 100MB)
- **Execution Time**: Maximum execution time per operation (default: 5 seconds)
- **File Operations**: Limited file system access and size limits
- **Network Requests**: Controlled network access with rate limiting
- **Database Queries**: Limited database access with query counting

### 4. Permission Levels

#### Readonly Level
- **Permissions**: `['read']`
- **Access**: Read-only access to plugin data
- **Use Case**: Display-only plugins, analytics viewers

#### Basic Level
- **Permissions**: `['read', 'write']`
- **Access**: Read/write access to plugin data
- **Use Case**: Data processing plugins, configuration managers

#### Advanced Level
- **Permissions**: `['read', 'write', 'network', 'database']`
- **Access**: Full data access plus network and database capabilities
- **Use Case**: API integration plugins, data synchronization

#### Admin Level
- **Permissions**: `['read', 'write', 'network', 'database', 'system']`
- **Access**: Full system access with monitoring
- **Use Case**: System administration plugins, monitoring tools

## Implementation

### Core Components

#### 1. BeamPluginSandbox
```javascript
const BeamPluginSandbox = require('./BeamPluginSandbox');

// Create sandbox for plugin
const sandbox = BeamPluginSandbox.createSandbox(pluginId, manifest, permissionLevel);

// Execute code in sandbox
const result = await BeamPluginSandbox.executeInSandbox(pluginId, code, options);

// Load plugin file in sandbox
const pluginCode = await BeamPluginSandbox.loadPluginFile(pluginId, filePath);
```

#### 2. BeamPluginSecurity
```javascript
const BeamPluginSecurity = require('../middleware/BeamPluginSecurity');

// Apply security middleware
BeamPluginSecurity.applyPluginSecurityMiddleware(app);
```

### Plugin Manifest Security

#### Required Security Fields
```yaml
id: "my-plugin"
name: "My Plugin"
version: "1.0.0"
description: "Plugin description"
author: "Author Name"
permissionLevel: "basic"  # readonly, basic, advanced, admin

# Security settings
security:
  maxMemoryMB: 50
  maxExecutionTimeMs: 3000
  maxFileSizeKB: 512
  maxNetworkRequests: 5
  maxDatabaseQueries: 25

# Allowed modules (if custom)
allowedModules:
  - "path"
  - "util"
  - "events"

# Blocked patterns (if custom)
blockedPatterns:
  - "eval"
  - "Function"
  - "process"
```

### Safe Plugin Development

#### 1. Plugin Structure
```
my-plugin/
├── plugin.yaml          # Plugin manifest with security settings
├── index.js            # Main plugin file (sandboxed)
├── README.md           # Documentation
├── assets/             # Static assets
├── data/               # Plugin data (auto-created)
└── logs/               # Plugin logs (auto-created)
```

#### 2. Safe Plugin Code Example
```javascript
// Safe plugin code
module.exports = {
    init: async function(plugin, manager) {
        // Plugin initialization
        plugin.log('info', 'Plugin initialized');
        
        // Use safe APIs
        const data = await plugin.getData('config');
        await plugin.setData('status', { initialized: true });
        
        return {
            name: 'My Plugin',
            version: '1.0.0'
        };
    },

    hooks: {
        onRequest: async function(req, res) {
            // Safe request handling
            const result = await this.processRequest(req);
            return result;
        },

        onFileUpload: async function(file) {
            // Safe file processing
            const processed = await this.processFile(file);
            return processed;
        }
    },

    cleanup: async function() {
        // Cleanup resources
        plugin.log('info', 'Plugin cleanup completed');
    }
};
```

#### 3. Unsafe Patterns to Avoid
```javascript
// ❌ UNSAFE - Direct module access
const fs = require('fs');
const process = require('process');

// ❌ UNSAFE - Code evaluation
eval('console.log("dangerous")');
new Function('console.log("dangerous")');

// ❌ UNSAFE - Process access
process.exit(1);
process.env.SECRET_KEY;

// ❌ UNSAFE - File system access
fs.readFileSync('/etc/passwd');
fs.writeFileSync('/tmp/malicious', 'data');

// ❌ UNSAFE - Network access without permission
const http = require('http');
fetch('http://malicious-site.com');
```

## API Reference

### BeamPluginSandbox Methods

#### createSandbox(pluginId, manifest, permissionLevel)
Creates a new sandboxed environment for a plugin.

**Parameters:**
- `pluginId` (string): Unique plugin identifier
- `manifest` (object): Plugin manifest object
- `permissionLevel` (string): Permission level (readonly, basic, advanced, admin)

**Returns:** Sandbox object

#### executeInSandbox(pluginId, code, options)
Executes code in a sandboxed environment.

**Parameters:**
- `pluginId` (string): Plugin identifier
- `code` (string): Code to execute
- `options` (object): Execution options
  - `timeout` (number): Execution timeout in milliseconds

**Returns:** Promise with execution result

#### loadPluginFile(pluginId, filePath)
Loads and executes a plugin file in sandbox.

**Parameters:**
- `pluginId` (string): Plugin identifier
- `filePath` (string): Path to plugin file

**Returns:** Promise with plugin module

#### validateCode(code, permissions)
Validates code for security and permissions.

**Parameters:**
- `code` (string): Code to validate
- `permissions` (array): Plugin permissions

**Throws:** Error if validation fails

#### getSandboxInfo(pluginId)
Gets sandbox information for a plugin.

**Parameters:**
- `pluginId` (string): Plugin identifier

**Returns:** Sandbox information object

#### destroySandbox(pluginId)
Destroys a sandbox.

**Parameters:**
- `pluginId` (string): Plugin identifier

### BeamPluginSecurity Methods

#### applyPluginSecurityMiddleware(app)
Applies security middleware to Express app.

**Parameters:**
- `app` (object): Express app instance

#### getSecurityStats()
Gets security statistics.

**Returns:** Security statistics object

#### resetRateLimits(pluginId)
Resets rate limit counters.

**Parameters:**
- `pluginId` (string): Optional plugin identifier

## Security Best Practices

### 1. Plugin Development
- Always use the provided safe APIs
- Avoid direct module requires
- Implement proper error handling
- Use permission-appropriate functionality
- Test plugins in sandboxed environment

### 2. System Administration
- Regularly review plugin permissions
- Monitor resource usage
- Update security rules as needed
- Audit plugin code before installation
- Implement proper access controls

### 3. Monitoring and Logging
- Monitor sandbox resource usage
- Log security violations
- Track plugin performance
- Review error logs regularly
- Implement alerting for security issues

## Configuration

### Environment Variables
```bash
# Plugin security settings
PLUGIN_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
PLUGIN_MAX_MEMORY_MB=100
PLUGIN_MAX_EXECUTION_TIME_MS=5000
PLUGIN_MAX_FILE_SIZE_KB=1024
PLUGIN_MAX_NETWORK_REQUESTS=10
PLUGIN_MAX_DATABASE_QUERIES=50
```

### Security Rules Configuration
```javascript
// Custom security rules
const customRules = {
    rateLimits: {
        pluginApi: { windowMs: 60 * 1000, max: 30 },
        pluginExecution: { windowMs: 60 * 1000, max: 5 }
    },
    allowedOrigins: ['https://my-domain.com'],
    blockedPatterns: [
        /custom-dangerous-pattern/gi
    ]
};
```

## Error Handling

### Security Error Codes
- `PLUGIN_SECURITY_001`: Origin not allowed
- `PLUGIN_SECURITY_002`: Missing plugin ID header
- `PLUGIN_SECURITY_003`: Missing plugin version header
- `PLUGIN_SECURITY_004`: Invalid plugin ID format
- `PLUGIN_SECURITY_005`: Internal security validation error
- `PLUGIN_SECURITY_006`: Plugin API rate limit exceeded
- `PLUGIN_SECURITY_007`: Invalid input data detected
- `PLUGIN_SECURITY_008`: Plugin sandbox not found
- `PLUGIN_SECURITY_009`: Plugin is not active
- `PLUGIN_SECURITY_010`: Plugin memory limit exceeded
- `PLUGIN_SECURITY_011`: Plugin network request limit exceeded
- `PLUGIN_SECURITY_012`: Internal permission validation error
- `PLUGIN_SECURITY_013`: Code execution requires valid code string
- `PLUGIN_SECURITY_014`: Code execution size limit exceeded
- `PLUGIN_SECURITY_015`: Dangerous code pattern detected
- `PLUGIN_SECURITY_016`: Code validation failed
- `PLUGIN_SECURITY_017`: Internal execution validation error
- `PLUGIN_SECURITY_018`: Plugin execution rate limit exceeded
- `PLUGIN_SECURITY_019`: Admin privileges required
- `PLUGIN_SECURITY_020`: Plugin package file required
- `PLUGIN_SECURITY_021`: Plugin package size limit exceeded
- `PLUGIN_SECURITY_022`: Invalid plugin package format
- `PLUGIN_SECURITY_023`: Internal installation validation error
- `PLUGIN_SECURITY_024`: Plugin package scanning failed

### Error Response Format
```json
{
    "error": "PluginSecurityError",
    "message": "Error description",
    "code": "PLUGIN_SECURITY_XXX",
    "retryAfter": 60
}
```

## Testing

### Security Testing
```javascript
// Test plugin security
const securityTest = async () => {
    const pluginId = 'test-plugin';
    const manifest = {
        id: pluginId,
        name: 'Test Plugin',
        version: '1.0.0',
        permissionLevel: 'basic'
    };

    // Create sandbox
    const sandbox = BeamPluginSandbox.createSandbox(pluginId, manifest, 'basic');

    // Test safe code
    const safeCode = 'console.log("Hello World");';
    const result = await BeamPluginSandbox.executeInSandbox(pluginId, safeCode);

    // Test unsafe code (should fail)
    try {
        const unsafeCode = 'require("fs").readFileSync("/etc/passwd");';
        await BeamPluginSandbox.executeInSandbox(pluginId, unsafeCode);
    } catch (error) {
        console.log('Security test passed:', error.message);
    }

    // Cleanup
    BeamPluginSandbox.destroySandbox(pluginId);
};
```

## Migration Guide

### From Legacy Plugin System
1. Update plugin manifests to include security settings
2. Replace direct module requires with safe APIs
3. Implement proper error handling
4. Test plugins in sandboxed environment
5. Update plugin documentation

### Security Checklist
- [ ] Plugin manifest includes security settings
- [ ] Code uses safe APIs only
- [ ] No direct module requires
- [ ] Proper error handling implemented
- [ ] Resource limits configured
- [ ] Permission level appropriate
- [ ] Security testing completed
- [ ] Documentation updated

## Support

For questions about the plugin sandboxing system:
- Check the error logs for specific issues
- Review the security documentation
- Test plugins in development environment
- Contact the development team for assistance

---

*This sandboxing system ensures that plugins can extend functionality while maintaining system security and stability.*

# Plugin Settings Integration Guide

This guide explains how plugins can integrate with the unified BeamSettings system to manage their own settings and access API keys.

## Overview

The BeamSettings system provides a unified interface for managing environment variables, API keys, and plugin-specific settings. Plugins can integrate with this system to:

- Store and retrieve their own settings
- Access API keys from the main settings system
- Provide a consistent UI for configuration
- Automatically save settings changes

## Quick Start

### 1. Basic Plugin Settings Integration

```javascript
// In your plugin's main file
class MyPlugin {
  constructor() {
    this.settings = null;
    this.init();
  }

  async init() {
    // Load BeamPluginSettings if not already available
    if (!window.BeamPluginSettings) {
      await this.loadBeamPluginSettings();
    }

    // Initialize plugin settings
    this.settings = new BeamPluginSettings('my-plugin', {
      autoSave: true,
      showApiKeys: true
    });

    await this.settings.init();
  }

  async loadBeamPluginSettings() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/src/frontend/js/BeamPluginSettings.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
```

### 2. Define Plugin Settings Fields

```javascript
// Define your plugin's settings configuration
const pluginSettingsConfig = {
  title: 'My Plugin Settings',
  description: 'Configure My Plugin behavior and API keys',
  fields: [
    {
      name: 'enabled',
      label: 'Enable Plugin',
      type: 'checkbox',
      description: 'Enable or disable the plugin functionality'
    },
    {
      name: 'api_endpoint',
      label: 'API Endpoint',
      type: 'text',
      placeholder: 'https://api.example.com',
      description: 'The API endpoint for external service calls',
      required: true
    },
    {
      name: 'timeout',
      label: 'Request Timeout',
      type: 'number',
      placeholder: '5000',
      description: 'Request timeout in milliseconds'
    },
    {
      name: 'log_level',
      label: 'Log Level',
      type: 'select',
      options: [
        { value: 'debug', label: 'Debug' },
        { value: 'info', label: 'Info' },
        { value: 'warn', label: 'Warning' },
        { value: 'error', label: 'Error' }
      ],
      description: 'Set the logging level for the plugin'
    }
  ]
};
```

### 3. Render Settings Form

```javascript
// Render the settings form in your plugin's admin interface
renderSettings() {
  const container = document.getElementById('my-plugin-settings');
  this.settings.renderSettingsForm(container, pluginSettingsConfig);
}
```

## API Reference

### BeamPluginSettings Class

#### Constructor

```javascript
new BeamPluginSettings(pluginName, options)
```

**Parameters:**
- `pluginName` (string): The name of your plugin
- `options` (object): Configuration options
  - `autoSave` (boolean): Auto-save settings on change (default: true)
  - `validateOnChange` (boolean): Validate settings on change (default: true)
  - `showApiKeys` (boolean): Show API keys section (default: true)

#### Methods

##### `init()`
Initialize the plugin settings system.

```javascript
await pluginSettings.init();
```

##### `loadSettings()`
Load settings from the server.

```javascript
const settings = await pluginSettings.loadSettings();
```

##### `saveSettings(settings)`
Save settings to the server.

```javascript
await pluginSettings.saveSettings({
  enabled: true,
  api_endpoint: 'https://api.example.com'
});
```

##### `getSetting(key, defaultValue)`
Get a setting value.

```javascript
const enabled = pluginSettings.getSetting('enabled', false);
const endpoint = pluginSettings.getSetting('api_endpoint', 'https://default.com');
```

##### `setSetting(key, value)`
Set a setting value (auto-saves if enabled).

```javascript
pluginSettings.setSetting('enabled', true);
pluginSettings.setSetting('timeout', 5000);
```

##### `getApiKey(keyName)`
Get an API key from the main settings system.

```javascript
const apiKey = pluginSettings.getApiKey('MY_PLUGIN_API_KEY');
```

##### `hasApiKey(keyName)`
Check if an API key exists.

```javascript
if (pluginSettings.hasApiKey('MY_PLUGIN_API_KEY')) {
  // Use the API key
}
```

##### `getAllApiKeys()`
Get all API keys available to this plugin.

```javascript
const apiKeys = pluginSettings.getAllApiKeys();
```

##### `renderSettingsForm(container, config)`
Render the settings form.

```javascript
pluginSettings.renderSettingsForm(container, {
  title: 'My Plugin Settings',
  description: 'Configure plugin behavior',
  fields: [...],
  showApiKeys: true
});
```

#### Events

##### `on(event, callback)`
Register event callbacks.

```javascript
pluginSettings.on('save', (data) => {
  console.log('Settings saved:', data);
});

pluginSettings.on('load', (data) => {
  console.log('Settings loaded:', data);
});

pluginSettings.on('error', (error) => {
  console.error('Settings error:', error);
});
```

##### `off(event, callback)`
Remove event callbacks.

```javascript
pluginSettings.off('save', myCallback);
```

## Field Types

### Text Input
```javascript
{
  name: 'api_endpoint',
  label: 'API Endpoint',
  type: 'text',
  placeholder: 'https://api.example.com',
  description: 'The API endpoint URL',
  required: true
}
```

### Number Input
```javascript
{
  name: 'timeout',
  label: 'Timeout',
  type: 'number',
  placeholder: '5000',
  description: 'Request timeout in milliseconds'
}
```

### Password Input
```javascript
{
  name: 'secret_key',
  label: 'Secret Key',
  type: 'password',
  description: 'Your secret API key'
}
```

### Select Dropdown
```javascript
{
  name: 'environment',
  label: 'Environment',
  type: 'select',
  options: [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ],
  description: 'Select the environment'
}
```

### Checkbox
```javascript
{
  name: 'enabled',
  label: 'Enable Plugin',
  type: 'checkbox',
  description: 'Enable or disable the plugin'
}
```

### Textarea
```javascript
{
  name: 'custom_config',
  label: 'Custom Configuration',
  type: 'textarea',
  placeholder: 'Enter custom configuration...',
  description: 'JSON configuration for advanced settings'
}
```

## API Keys Integration

### Accessing API Keys

Plugins can access API keys that are configured in the main settings system:

```javascript
// Get a specific API key
const apiKey = pluginSettings.getApiKey('OPENAI_API_KEY');

// Check if API key exists
if (pluginSettings.hasApiKey('STRIPE_SECRET_KEY')) {
  const stripeKey = pluginSettings.getApiKey('STRIPE_SECRET_KEY');
  // Use the API key
}

// Get all available API keys
const allKeys = pluginSettings.getAllApiKeys();
```

### API Key Naming Convention

To make API keys available to your plugin, use one of these naming patterns:

1. **Plugin-specific keys**: `MY_PLUGIN_API_KEY`, `MY_PLUGIN_SECRET`
2. **Service-specific keys**: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`
3. **Generic keys**: `API_KEY`, `SECRET_KEY`

The system will automatically filter API keys based on your plugin name or service type.

## Complete Example

Here's a complete example of a plugin with settings integration:

```javascript
class ImageGeneratorPlugin {
  constructor() {
    this.settings = null;
    this.init();
  }

  async init() {
    // Load BeamPluginSettings
    if (!window.BeamPluginSettings) {
      await this.loadBeamPluginSettings();
    }

    // Initialize settings
    this.settings = new BeamPluginSettings('image-generator', {
      autoSave: true,
      showApiKeys: true
    });

    await this.settings.init();

    // Set up event listeners
    this.settings.on('save', this.onSettingsSave.bind(this));
    this.settings.on('error', this.onSettingsError.bind(this));
  }

  async loadBeamPluginSettings() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/src/frontend/js/BeamPluginSettings.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  renderSettingsForm(container) {
    const config = {
      title: 'Image Generator Settings',
      description: 'Configure AI image generation settings',
      fields: [
        {
          name: 'enabled',
          label: 'Enable Image Generation',
          type: 'checkbox',
          description: 'Enable or disable the image generation feature'
        },
        {
          name: 'model',
          label: 'AI Model',
          type: 'select',
          options: [
            { value: 'dall-e-2', label: 'DALL-E 2' },
            { value: 'dall-e-3', label: 'DALL-E 3' },
            { value: 'stable-diffusion', label: 'Stable Diffusion' }
          ],
          description: 'Select the AI model for image generation'
        },
        {
          name: 'max_images',
          label: 'Maximum Images',
          type: 'number',
          placeholder: '4',
          description: 'Maximum number of images to generate per request'
        },
        {
          name: 'image_size',
          label: 'Image Size',
          type: 'select',
          options: [
            { value: '256x256', label: '256x256' },
            { value: '512x512', label: '512x512' },
            { value: '1024x1024', label: '1024x1024' }
          ],
          description: 'Size of generated images'
        }
      ]
    };

    this.settings.renderSettingsForm(container, config);
  }

  async generateImage(prompt) {
    // Check if plugin is enabled
    if (!this.settings.getSetting('enabled', false)) {
      throw new Error('Image generation is disabled');
    }

    // Get API key
    const apiKey = this.settings.getApiKey('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get settings
    const model = this.settings.getSetting('model', 'dall-e-2');
    const maxImages = this.settings.getSetting('max_images', 1);
    const imageSize = this.settings.getSetting('image_size', '512x512');

    // Make API call
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        n: maxImages,
        size: imageSize,
        model: model
      })
    });

    return await response.json();
  }

  onSettingsSave(data) {
    console.log('Image generator settings saved:', data);
    // Optionally refresh the plugin or update UI
  }

  onSettingsError(error) {
    console.error('Image generator settings error:', error);
    // Handle error (show notification, etc.)
  }
}

// Initialize the plugin
const imageGenerator = new ImageGeneratorPlugin();
```

## Best Practices

### 1. Error Handling
Always handle errors when loading or saving settings:

```javascript
try {
  await this.settings.init();
} catch (error) {
  console.error('Failed to initialize plugin settings:', error);
  // Show user-friendly error message
}
```

### 2. Default Values
Provide sensible default values for all settings:

```javascript
const enabled = this.settings.getSetting('enabled', false);
const timeout = this.settings.getSetting('timeout', 5000);
const endpoint = this.settings.getSetting('api_endpoint', 'https://default.com');
```

### 3. Validation
Validate settings before using them:

```javascript
const apiKey = this.settings.getApiKey('MY_API_KEY');
if (!apiKey) {
  throw new Error('API key not configured. Please configure it in the settings.');
}
```

### 4. Event Handling
Use events to respond to settings changes:

```javascript
this.settings.on('save', (data) => {
  // Refresh plugin functionality
  this.refreshPlugin();
});

this.settings.on('error', (error) => {
  // Show error notification to user
  this.showErrorNotification(error.message);
});
```

### 5. API Key Security
Never log or expose API keys:

```javascript
// Good
const apiKey = this.settings.getApiKey('MY_API_KEY');
if (apiKey) {
  // Use the API key
}

// Bad - never do this
console.log('API Key:', apiKey);
```

## Integration with Main Settings

Plugins automatically integrate with the main settings system. When users access the Settings section in the admin dashboard, they can:

1. **View all settings**: General, security, database, email, OAuth, API keys, and plugins
2. **Manage API keys**: View, edit, and copy API keys
3. **Configure plugins**: Access plugin-specific settings through the Plugins section
4. **Environment variables**: Manage all environment variables from one interface

The system provides a unified experience where plugins can access the same API keys and settings that are configured in the main system, eliminating the need for duplicate configuration.

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check that the plugin name matches the API endpoint
2. **API keys not found**: Ensure API keys are properly configured in the main settings
3. **Form not rendering**: Verify that the container element exists and is accessible
4. **Auto-save not working**: Check that `autoSave` option is enabled

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
const pluginSettings = new BeamPluginSettings('my-plugin', {
  debug: true
});
```

This will log detailed information about settings operations to the console.

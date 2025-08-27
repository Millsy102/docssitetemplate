/**
 * BeamFlow Settings Manager Widget
 * 
 * Provides a unified interface for managing all plugin settings
 * with dynamic form generation based on plugin schemas
 */

const path = require('path');
const fs = require('fs-extra');
const BeamPluginManager = require('../plugins/BeamPluginManager');

class BeamSettingsManager {
    constructor() {
        this.name = 'BeamSettingsManager';
        this.description = 'Unified plugin settings management interface';
        this.version = '1.0.0';
    }

    /**
     * Get the main settings management widget HTML
     */
    async getSettingsWidget() {
        const plugins = BeamPluginManager.getAllPlugins();
        const settingsOverview = await this.getSettingsOverview();

        return `
            <div class="settings-manager-widget">
                <div class="settings-header">
                    <h2><i class="material-icons">settings</i> Plugin Settings Manager</h2>
                    <div class="settings-stats">
                        <div class="stat">
                            <span class="stat-number">${settingsOverview.totalPlugins}</span>
                            <span class="stat-label">Total Plugins</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${settingsOverview.enabledPlugins}</span>
                            <span class="stat-label">Enabled</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${settingsOverview.totalSettings}</span>
                            <span class="stat-label">Settings</span>
                        </div>
                    </div>
                </div>

                <div class="settings-content">
                    <div class="settings-sidebar">
                        <div class="plugin-list">
                            <h3>Plugins</h3>
                            ${plugins.map(plugin => `
                                <div class="plugin-item" data-plugin-id="${plugin.id}">
                                    <div class="plugin-info">
                                        <span class="plugin-name">${plugin.name}</span>
                                        <span class="plugin-status ${plugin.status}">${plugin.status}</span>
                                    </div>
                                    <div class="plugin-meta">
                                        <span class="plugin-version">v${plugin.version}</span>
                                        <span class="plugin-author">by ${plugin.author}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="settings-main">
                        <div id="settings-form-container">
                            <div class="no-plugin-selected">
                                <i class="material-icons">settings</i>
                                <h3>Select a Plugin</h3>
                                <p>Choose a plugin from the sidebar to manage its settings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-footer">
                    <button id="save-all-settings" class="btn btn-primary" disabled>
                        <i class="material-icons">save</i> Save All Changes
                    </button>
                    <button id="reset-all-settings" class="btn btn-secondary">
                        <i class="material-icons">restore</i> Reset to Defaults
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get settings overview statistics
     */
    async getSettingsOverview() {
        try {
            const plugins = BeamPluginManager.getAllPlugins();
            const enabledPlugins = BeamPluginManager.getEnabledPlugins();
            const allSettings = await BeamPluginManager.getAllPluginSettings();

            return {
                totalPlugins: plugins.length,
                enabledPlugins: enabledPlugins.length,
                disabledPlugins: plugins.length - enabledPlugins.length,
                totalSettings: allSettings.length,
                totalSettingsValues: allSettings.reduce((sum, pluginSettings) => 
                    sum + Object.keys(pluginSettings.settings || {}).length, 0
                )
            };
        } catch (error) {
            console.error('Settings overview error:', error);
            return {
                totalPlugins: 0,
                enabledPlugins: 0,
                disabledPlugins: 0,
                totalSettings: 0,
                totalSettingsValues: 0
            };
        }
    }

    /**
     * Generate settings form for a specific plugin
     */
    async generateSettingsForm(pluginId) {
        try {
            const schema = await BeamPluginManager.getPluginSettingsSchema(pluginId);
            const currentSettings = await BeamPluginManager.getPluginSettings(pluginId);
            const plugin = BeamPluginManager.getPlugin(pluginId);

            if (!plugin) {
                return '<div class="error">Plugin not found</div>';
            }

            let formHTML = `
                <div class="plugin-settings-form" data-plugin-id="${pluginId}">
                    <div class="plugin-header">
                        <h3><i class="material-icons">extension</i> ${plugin.name}</h3>
                        <p class="plugin-description">${plugin.description}</p>
                        <div class="plugin-meta">
                            <span class="version">v${plugin.version}</span>
                            <span class="author">by ${plugin.author}</span>
                            <span class="status ${plugin.status}">${plugin.status}</span>
                        </div>
                    </div>

                    <div class="settings-form">
            `;

            if (Object.keys(schema).length === 0) {
                formHTML += `
                    <div class="no-settings">
                        <i class="material-icons">info</i>
                        <h4>No Settings Available</h4>
                        <p>This plugin doesn't have any configurable settings.</p>
                    </div>
                `;
            } else {
                for (const [key, setting] of Object.entries(schema)) {
                    const currentValue = currentSettings[key]?.value || setting.default || '';
                    formHTML += this.generateSettingField(key, setting, currentValue);
                }
            }

            formHTML += `
                    </div>

                    <div class="form-actions">
                        <button class="btn btn-primary save-settings" data-plugin-id="${pluginId}">
                            <i class="material-icons">save</i> Save Settings
                        </button>
                        <button class="btn btn-secondary reset-settings" data-plugin-id="${pluginId}">
                            <i class="material-icons">restore</i> Reset to Defaults
                        </button>
                    </div>
                </div>
            `;

            return formHTML;
        } catch (error) {
            console.error('Generate settings form error:', error);
            return `<div class="error">Error loading settings: ${error.message}</div>`;
        }
    }

    /**
     * Generate HTML for a single setting field
     */
    generateSettingField(key, setting, currentValue) {
        const fieldId = `setting-${key}`;
        const isEncrypted = setting.encrypted === true;
        const isRequired = setting.required === true;

        let fieldHTML = `
            <div class="setting-field" data-setting-key="${key}">
                <div class="setting-label">
                    <label for="${fieldId}">${setting.description || key}</label>
                    ${isRequired ? '<span class="required">*</span>' : ''}
                    ${isEncrypted ? '<i class="material-icons encrypted-icon" title="Encrypted setting">lock</i>' : ''}
                </div>
        `;

        switch (setting.type) {
            case 'string':
                if (isEncrypted) {
                    fieldHTML += `
                        <input type="password" 
                               id="${fieldId}" 
                               name="${key}" 
                               value="${currentValue}"
                               placeholder="${setting.placeholder || ''}"
                               ${isRequired ? 'required' : ''}
                               class="setting-input encrypted-input">
                    `;
                } else {
                    fieldHTML += `
                        <input type="text" 
                               id="${fieldId}" 
                               name="${key}" 
                               value="${currentValue}"
                               placeholder="${setting.placeholder || ''}"
                               ${isRequired ? 'required' : ''}
                               class="setting-input">
                    `;
                }
                break;

            case 'number':
                fieldHTML += `
                    <input type="number" 
                           id="${fieldId}" 
                           name="${key}" 
                           value="${currentValue}"
                           min="${setting.min || ''}"
                           max="${setting.max || ''}"
                           step="${setting.step || '1'}"
                           ${isRequired ? 'required' : ''}
                           class="setting-input">
                `;
                break;

            case 'boolean':
                fieldHTML += `
                    <div class="toggle-switch">
                        <input type="checkbox" 
                               id="${fieldId}" 
                               name="${key}" 
                               ${currentValue ? 'checked' : ''}
                               class="setting-toggle">
                        <label for="${fieldId}" class="toggle-label"></label>
                    </div>
                `;
                break;

            case 'select':
                fieldHTML += `
                    <select id="${fieldId}" 
                            name="${key}" 
                            ${isRequired ? 'required' : ''}
                            class="setting-select">
                        ${setting.options?.map(option => `
                            <option value="${option.value}" ${currentValue === option.value ? 'selected' : ''}>
                                ${option.label}
                            </option>
                        `).join('') || ''}
                    </select>
                `;
                break;

            case 'textarea':
                fieldHTML += `
                    <textarea id="${fieldId}" 
                              name="${key}" 
                              placeholder="${setting.placeholder || ''}"
                              rows="${setting.rows || 4}"
                              ${isRequired ? 'required' : ''}
                              class="setting-textarea">${currentValue}</textarea>
                `;
                break;

            default:
                fieldHTML += `
                    <input type="text" 
                           id="${fieldId}" 
                           name="${key}" 
                           value="${currentValue}"
                           class="setting-input">
                `;
        }

        if (setting.help) {
            fieldHTML += `<div class="setting-help">${setting.help}</div>`;
        }

        fieldHTML += '</div>';
        return fieldHTML;
    }

    /**
     * Get the CSS styles for the settings manager
     */
    getCSS() {
        return `
            .settings-manager-widget {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .settings-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .settings-header h2 {
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.5rem;
            }

            .settings-stats {
                display: flex;
                gap: 20px;
            }

            .stat {
                text-align: center;
            }

            .stat-number {
                display: block;
                font-size: 1.5rem;
                font-weight: bold;
            }

            .stat-label {
                font-size: 0.8rem;
                opacity: 0.8;
            }

            .settings-content {
                display: flex;
                min-height: 500px;
            }

            .settings-sidebar {
                width: 300px;
                background: #f8f9fa;
                border-right: 1px solid #e9ecef;
            }

            .plugin-list {
                padding: 20px;
            }

            .plugin-list h3 {
                margin: 0 0 15px 0;
                color: #495057;
                font-size: 1.1rem;
            }

            .plugin-item {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .plugin-item:hover {
                border-color: #667eea;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
            }

            .plugin-item.selected {
                border-color: #667eea;
                background: #f8f9ff;
            }

            .plugin-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }

            .plugin-name {
                font-weight: 600;
                color: #495057;
            }

            .plugin-status {
                font-size: 0.8rem;
                padding: 2px 8px;
                border-radius: 12px;
                text-transform: uppercase;
            }

            .plugin-status.active {
                background: #d4edda;
                color: #155724;
            }

            .plugin-status.disabled {
                background: #f8d7da;
                color: #721c24;
            }

            .plugin-meta {
                display: flex;
                gap: 10px;
                font-size: 0.8rem;
                color: #6c757d;
            }

            .settings-main {
                flex: 1;
                padding: 20px;
                background: white;
            }

            .no-plugin-selected {
                text-align: center;
                padding: 60px 20px;
                color: #6c757d;
            }

            .no-plugin-selected i {
                font-size: 3rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }

            .plugin-settings-form {
                max-width: 800px;
            }

            .plugin-header {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }

            .plugin-header h3 {
                margin: 0 0 10px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #495057;
            }

            .plugin-description {
                color: #6c757d;
                margin: 0 0 15px 0;
            }

            .plugin-meta {
                display: flex;
                gap: 15px;
                font-size: 0.9rem;
            }

            .plugin-meta span {
                padding: 4px 8px;
                background: white;
                border-radius: 4px;
                border: 1px solid #e9ecef;
            }

            .settings-form {
                display: grid;
                gap: 25px;
            }

            .setting-field {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }

            .setting-label {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                font-weight: 600;
                color: #495057;
            }

            .required {
                color: #dc3545;
                font-weight: bold;
            }

            .encrypted-icon {
                font-size: 1rem;
                color: #ffc107;
            }

            .setting-input,
            .setting-select,
            .setting-textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 0.9rem;
                transition: border-color 0.2s ease;
            }

            .setting-input:focus,
            .setting-select:focus,
            .setting-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .setting-textarea {
                resize: vertical;
                min-height: 100px;
            }

            .toggle-switch {
                position: relative;
                display: inline-block;
            }

            .setting-toggle {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-label {
                display: block;
                width: 50px;
                height: 24px;
                background: #ced4da;
                border-radius: 12px;
                cursor: pointer;
                position: relative;
                transition: background 0.2s ease;
            }

            .toggle-label:before {
                content: '';
                position: absolute;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: white;
                top: 3px;
                left: 3px;
                transition: transform 0.2s ease;
            }

            .setting-toggle:checked + .toggle-label {
                background: #667eea;
            }

            .setting-toggle:checked + .toggle-label:before {
                transform: translateX(26px);
            }

            .setting-help {
                margin-top: 8px;
                font-size: 0.8rem;
                color: #6c757d;
                font-style: italic;
            }

            .no-settings {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }

            .no-settings i {
                font-size: 2rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .form-actions {
                display: flex;
                gap: 15px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: none;
                border-radius: 6px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
            }

            .btn-primary {
                background: #667eea;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #5a6fd8;
                transform: translateY(-1px);
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background: #5a6268;
                transform: translateY(-1px);
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .settings-footer {
                background: #f8f9fa;
                padding: 20px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
            }

            .error {
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #f5c6cb;
            }

            .success {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #c3e6cb;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }

            .loading i {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
    }

    /**
     * Get the JavaScript for the settings manager
     */
    getJavaScript() {
        return `
            class BeamSettingsManager {
                constructor() {
                    this.currentPluginId = null;
                    this.hasChanges = false;
                    this.init();
                }

                init() {
                    this.bindEvents();
                    this.loadSettingsOverview();
                }

                bindEvents() {
                    // Plugin selection
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('.plugin-item')) {
                            const pluginItem = e.target.closest('.plugin-item');
                            const pluginId = pluginItem.dataset.pluginId;
                            this.selectPlugin(pluginId);
                        }
                    });

                    // Save settings
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('.save-settings')) {
                            const button = e.target.closest('.save-settings');
                            const pluginId = button.dataset.pluginId;
                            this.savePluginSettings(pluginId);
                        }
                    });

                    // Reset settings
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('.reset-settings')) {
                            const button = e.target.closest('.reset-settings');
                            const pluginId = button.dataset.pluginId;
                            this.resetPluginSettings(pluginId);
                        }
                    });

                    // Save all settings
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('#save-all-settings')) {
                            this.saveAllSettings();
                        }
                    });

                    // Reset all settings
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('#reset-all-settings')) {
                            this.resetAllSettings();
                        }
                    });

                    // Form changes
                    document.addEventListener('change', (e) => {
                        if (e.target.closest('.setting-input, .setting-select, .setting-textarea, .setting-toggle')) {
                            this.markAsChanged();
                        }
                    });

                    // Input changes
                    document.addEventListener('input', (e) => {
                        if (e.target.closest('.setting-input, .setting-textarea')) {
                            this.markAsChanged();
                        }
                    });
                }

                async selectPlugin(pluginId) {
                    try {
                        // Update UI
                        document.querySelectorAll('.plugin-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        document.querySelector(\`[data-plugin-id="\${pluginId}"]\`).classList.add('selected');

                        // Show loading
                        const container = document.getElementById('settings-form-container');
                        container.innerHTML = \`
                            <div class="loading">
                                <i class="material-icons">hourglass_empty</i>
                                <p>Loading settings...</p>
                            </div>
                        \`;

                        // Load settings form
                        const response = await fetch(\`/api/plugins/\${pluginId}/settings/form\`);
                        if (response.ok) {
                            const formHTML = await response.text();
                            container.innerHTML = formHTML;
                            this.currentPluginId = pluginId;
                        } else {
                            throw new Error('Failed to load settings');
                        }
                    } catch (error) {
                        console.error('Select plugin error:', error);
                        document.getElementById('settings-form-container').innerHTML = \`
                            <div class="error">
                                Error loading plugin settings: \${error.message}
                            </div>
                        \`;
                    }
                }

                async savePluginSettings(pluginId) {
                    try {
                        const form = document.querySelector(\`.plugin-settings-form[data-plugin-id="\${pluginId}"]\`);
                        if (!form) return;

                        const settings = this.collectFormData(form);
                        
                        const response = await fetch(\`/api/plugins/\${pluginId}/settings\`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.getAuthToken()
                            },
                            body: JSON.stringify(settings)
                        });

                        if (response.ok) {
                            this.showMessage('Settings saved successfully!', 'success');
                            this.markAsUnchanged();
                        } else {
                            throw new Error('Failed to save settings');
                        }
                    } catch (error) {
                        console.error('Save settings error:', error);
                        this.showMessage('Error saving settings: ' + error.message, 'error');
                    }
                }

                async resetPluginSettings(pluginId) {
                    if (!confirm('Are you sure you want to reset all settings for this plugin to their default values?')) {
                        return;
                    }

                    try {
                        const response = await fetch(\`/api/plugins/\${pluginId}/settings/reset\`, {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + this.getAuthToken()
                            }
                        });

                        if (response.ok) {
                            this.showMessage('Settings reset successfully!', 'success');
                            // Reload the form
                            await this.selectPlugin(pluginId);
                        } else {
                            throw new Error('Failed to reset settings');
                        }
                    } catch (error) {
                        console.error('Reset settings error:', error);
                        this.showMessage('Error resetting settings: ' + error.message, 'error');
                    }
                }

                async saveAllSettings() {
                    try {
                        const forms = document.querySelectorAll('.plugin-settings-form');
                        const allSettings = {};

                        for (const form of forms) {
                            const pluginId = form.dataset.pluginId;
                            const settings = this.collectFormData(form);
                            allSettings[pluginId] = settings;
                        }

                        // Save each plugin's settings
                        for (const [pluginId, settings] of Object.entries(allSettings)) {
                            await this.savePluginSettings(pluginId);
                        }

                        this.showMessage('All settings saved successfully!', 'success');
                    } catch (error) {
                        console.error('Save all settings error:', error);
                        this.showMessage('Error saving all settings: ' + error.message, 'error');
                    }
                }

                async resetAllSettings() {
                    if (!confirm('Are you sure you want to reset ALL plugin settings to their default values? This action cannot be undone.')) {
                        return;
                    }

                    try {
                        const plugins = document.querySelectorAll('.plugin-item');
                        
                        for (const plugin of plugins) {
                            const pluginId = plugin.dataset.pluginId;
                            await this.resetPluginSettings(pluginId);
                        }

                        this.showMessage('All settings reset successfully!', 'success');
                    } catch (error) {
                        console.error('Reset all settings error:', error);
                        this.showMessage('Error resetting all settings: ' + error.message, 'error');
                    }
                }

                collectFormData(form) {
                    const settings = {};
                    
                    // Collect input values
                    form.querySelectorAll('.setting-input, .setting-select, .setting-textarea').forEach(input => {
                        const key = input.name;
                        let value = input.value;
                        
                        // Handle boolean values
                        if (input.type === 'checkbox') {
                            value = input.checked;
                        }
                        
                        settings[key] = value;
                    });

                    // Collect toggle values
                    form.querySelectorAll('.setting-toggle').forEach(toggle => {
                        const key = toggle.name;
                        settings[key] = toggle.checked;
                    });

                    return settings;
                }

                markAsChanged() {
                    this.hasChanges = true;
                    document.getElementById('save-all-settings').disabled = false;
                }

                markAsUnchanged() {
                    this.hasChanges = false;
                    document.getElementById('save-all-settings').disabled = true;
                }

                showMessage(message, type) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = \`message \${type}\`;
                    messageDiv.textContent = message;
                    
                    const container = document.querySelector('.settings-manager-widget');
                    container.insertBefore(messageDiv, container.firstChild);
                    
                    setTimeout(() => {
                        messageDiv.remove();
                    }, 5000);
                }

                async loadSettingsOverview() {
                    try {
                        const response = await fetch('/api/settings/overview');
                        if (response.ok) {
                            const data = await response.json();
                            // Update stats if needed
                        }
                    } catch (error) {
                        console.error('Load settings overview error:', error);
                    }
                }

                getAuthToken() {
                    // Get auth token from localStorage or wherever it's stored
                    return localStorage.getItem('authToken') || '';
                }
            }

            // Initialize settings manager when DOM is loaded
            document.addEventListener('DOMContentLoaded', () => {
                new BeamSettingsManager();
            });
        `;
    }

    /**
     * Get the complete widget HTML with CSS and JavaScript
     */
    async getCompleteWidget() {
        const widgetHTML = await this.getSettingsWidget();
        const css = this.getCSS();
        const js = this.getJavaScript();

        return `
            <style>${css}</style>
            ${widgetHTML}
            <script>${js}</script>
        `;
    }
}

module.exports = BeamSettingsManager;

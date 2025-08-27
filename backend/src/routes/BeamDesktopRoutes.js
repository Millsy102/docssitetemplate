const express = require('express');
const router = express.Router();
const DesktopIntegrationsPlugin = require('../plugins/installed/active/desktop-integrations');

// Initialize the desktop integrations plugin
const desktopPlugin = new DesktopIntegrationsPlugin();

// Initialize the plugin when the routes are loaded
desktopPlugin.initialize().catch(console.error);

// Middleware to check if desktop client is connected
const requireDesktopConnection = (req, res, next) => {
    if (desktopPlugin.connections.size === 0) {
        return res.status(503).json({
            error: 'Desktop client not connected',
            message: 'Please ensure the desktop client is running and connected'
        });
    }
    next();
};

// Get desktop connection status
router.get('/status', async (req, res) => {
    try {
        const status = await desktopPlugin.getDesktopStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to desktop client
router.post('/connect', async (req, res) => {
    try {
        const { apiKey } = req.body;
        const result = await desktopPlugin.connectToDesktop(apiKey);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Disconnect from desktop client
router.post('/disconnect/:connectionId', requireDesktopConnection, async (req, res) => {
    try {
        const { connectionId } = req.params;
        const result = await desktopPlugin.disconnectFromDesktop(connectionId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Execute command on desktop software
router.post('/command', requireDesktopConnection, async (req, res) => {
    try {
        const { connectionId, software, command, params } = req.body;
        const result = await desktopPlugin.executeCommand(connectionId, software, command, params);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get list of available software
router.get('/software/list', async (req, res) => {
    try {
        const softwareList = await desktopPlugin.getSoftwareList();
        res.json(softwareList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Detect software on desktop
router.post('/software/detect/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const result = await desktopPlugin.detectSoftware(softwareName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Launch software
router.post('/software/launch/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const params = req.body;
        const result = await desktopPlugin.launchSoftware(softwareName, params);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Close software
router.post('/software/close/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const result = await desktopPlugin.closeSoftware(softwareName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create project
router.post('/project/create/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const projectParams = req.body;
        const result = await desktopPlugin.createProject(softwareName, projectParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Render scene
router.post('/render/start/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const renderParams = req.body;
        const result = await desktopPlugin.renderScene(softwareName, renderParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get render status
router.get('/render/status/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        res.json(command);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel render
router.post('/render/cancel/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        
        // Send cancel command to desktop client
        const connectionId = Array.from(desktopPlugin.connections.keys())[0];
        await desktopPlugin.executeCommand(connectionId, command.software, 'cancel_render', { commandId });
        
        res.json({ success: true, message: 'Render cancelled' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Export assets
router.post('/export/start/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const exportParams = req.body;
        const result = await desktopPlugin.exportAssets(softwareName, exportParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get export status
router.get('/export/status/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        res.json(command);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import assets
router.post('/import/start/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const importParams = req.body;
        const result = await desktopPlugin.importAssets(softwareName, importParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get import status
router.get('/import/status/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        res.json(command);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Batch processing
router.post('/batch/start/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const batchParams = req.body;
        const result = await desktopPlugin.batchProcess(softwareName, batchParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get batch status
router.get('/batch/status/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        res.json(command);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel batch
router.post('/batch/cancel/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        
        // Send cancel command to desktop client
        const connectionId = Array.from(desktopPlugin.connections.keys())[0];
        await desktopPlugin.executeCommand(connectionId, command.software, 'cancel_batch', { commandId });
        
        res.json({ success: true, message: 'Batch cancelled' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// File synchronization
router.post('/sync/start/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const syncParams = req.body;
        const result = await desktopPlugin.syncFiles(softwareName, syncParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get sync status
router.get('/sync/status/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        res.json(command);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel sync
router.post('/sync/cancel/:commandId', requireDesktopConnection, async (req, res) => {
    try {
        const { commandId } = req.params;
        const command = desktopPlugin.activeCommands.get(commandId);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }
        
        // Send cancel command to desktop client
        const connectionId = Array.from(desktopPlugin.connections.keys())[0];
        await desktopPlugin.executeCommand(connectionId, command.software, 'cancel_sync', { commandId });
        
        res.json({ success: true, message: 'Sync cancelled' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Backup management
router.post('/backup/create/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const backupParams = req.body;
        const result = await desktopPlugin.createBackup(softwareName, backupParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Restore backup
router.post('/backup/restore/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const restoreParams = req.body;
        const result = await desktopPlugin.restoreBackup(softwareName, restoreParams);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get backup list
router.get('/backup/list/:softwareName', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const result = await desktopPlugin.executeCommand(
            Array.from(desktopPlugin.connections.keys())[0],
            softwareName,
            'list_backups'
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get logs
router.get('/logs/:softwareName?', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const result = await desktopPlugin.getLogs(softwareName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Clear logs
router.delete('/logs/:softwareName?', requireDesktopConnection, async (req, res) => {
    try {
        const { softwareName } = req.params;
        const result = await desktopPlugin.executeCommand(
            Array.from(desktopPlugin.connections.keys())[0],
            'system',
            'clear_logs',
            { software: softwareName }
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await desktopPlugin.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update settings
router.put('/settings', async (req, res) => {
    try {
        const newSettings = req.body;
        const result = await desktopPlugin.updateSettings(newSettings);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get plugin list
router.get('/plugins/list', async (req, res) => {
    try {
        const pluginList = await desktopPlugin.getPluginList();
        res.json(pluginList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Install plugin
router.post('/plugins/install/:pluginName', requireDesktopConnection, async (req, res) => {
    try {
        const { pluginName } = req.params;
        const result = await desktopPlugin.installPlugin(pluginName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Uninstall plugin
router.delete('/plugins/uninstall/:pluginName', requireDesktopConnection, async (req, res) => {
    try {
        const { pluginName } = req.params;
        const result = await desktopPlugin.uninstallPlugin(pluginName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update plugin
router.put('/plugins/update/:pluginName', requireDesktopConnection, async (req, res) => {
    try {
        const { pluginName } = req.params;
        const result = await desktopPlugin.updatePlugin(pluginName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Configure plugin
router.put('/plugins/configure/:pluginName', requireDesktopConnection, async (req, res) => {
    try {
        const { pluginName } = req.params;
        const config = req.body;
        const result = await desktopPlugin.configurePlugin(pluginName, config);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Health check
router.get('/health/check', async (req, res) => {
    try {
        const health = await desktopPlugin.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restart plugin
router.post('/health/restart', async (req, res) => {
    try {
        const result = await desktopPlugin.restart();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Optimize plugin
router.post('/health/optimize', async (req, res) => {
    try {
        const result = await desktopPlugin.optimize();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WebSocket endpoint for real-time communication
router.ws('/ws', (ws, req) => {
    console.log(' WebSocket connection established for desktop routes');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(' Received WebSocket message:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'desktop_status':
                    ws.send(JSON.stringify({
                        type: 'desktop_status_response',
                        data: desktopPlugin.getDesktopStatus()
                    }));
                    break;
                case 'software_list':
                    ws.send(JSON.stringify({
                        type: 'software_list_response',
                        data: desktopPlugin.getSoftwareList()
                    }));
                    break;
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type'
                    }));
            }
        } catch (error) {
            console.error(' WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        console.log(' WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        console.error(' WebSocket error:', error);
    });
});

module.exports = router;

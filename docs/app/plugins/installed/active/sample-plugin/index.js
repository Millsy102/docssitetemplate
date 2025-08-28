/**
 * Sample Plugin for BeamFlow
 * Demonstrates plugin system capabilities
 */

class SamplePlugin {
    constructor(plugin, pluginManager) {
        this.plugin = plugin;
        this.pluginManager = pluginManager;
        this.requestCount = 0;
        this.startTime = Date.now();
    }

    // Plugin initialization
    async init() {
        console.log(`[${this.plugin.name}] Plugin initialized`);
        this.requestCount = 0;
        return this;
    }

    // Plugin cleanup
    async cleanup() {
        console.log(`[${this.plugin.name}] Plugin cleanup completed`);
    }

    // Hook implementations
    async onRequest(req, res) {
        this.requestCount++;
        
        // Add custom header to track plugin usage
        res.setHeader('X-Sample-Plugin', 'active');
        
        // Log request if debug is enabled
        if (this.plugin.manifest.config.debug) {
            console.log(`[${this.plugin.name}] Request #${this.requestCount}: ${req.method} ${req.path}`);
        }

        // Check if we've exceeded max requests
        if (this.requestCount > this.plugin.manifest.config.maxRequests) {
            console.warn(`[${this.plugin.name}] Max requests exceeded: ${this.requestCount}`);
        }
    }

    async onResponse(req, res) {
        // Add response time tracking
        const responseTime = Date.now() - this.startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
    }

    async onSystemStart() {
        console.log(`[${this.plugin.name}] System started - plugin ready`);
        this.startTime = Date.now();
    }

    async onSystemStop() {
        console.log(`[${this.plugin.name}] System stopping - plugin cleanup`);
        const uptime = Date.now() - this.startTime;
        console.log(`[${this.plugin.name}] Plugin uptime: ${uptime}ms, Requests handled: ${this.requestCount}`);
    }

    // Custom plugin methods
    getStats() {
        return {
            name: this.plugin.name,
            version: this.plugin.version,
            requestCount: this.requestCount,
            uptime: Date.now() - this.startTime,
            config: this.plugin.manifest.config
        };
    }

    resetStats() {
        this.requestCount = 0;
        this.startTime = Date.now();
        return { success: true, message: 'Stats reset' };
    }
}

// Export plugin hooks and initialization
module.exports = {
    // Plugin initialization function
    init: async (plugin, pluginManager) => {
        const instance = new SamplePlugin(plugin, pluginManager);
        return await instance.init();
    },

    // Hook implementations
    hooks: {
        onRequest: async function(req, res) {
            if (this.instance) {
                await this.instance.onRequest(req, res);
            }
        },

        onResponse: async function(req, res) {
            if (this.instance) {
                await this.instance.onResponse(req, res);
            }
        },

        onSystemStart: async function() {
            if (this.instance) {
                await this.instance.onSystemStart();
            }
        },

        onSystemStop: async function() {
            if (this.instance) {
                await this.instance.onSystemStop();
            }
        }
    },

    // Plugin metadata
    metadata: {
        name: 'Sample Plugin',
        description: 'A sample plugin demonstrating BeamFlow plugin system',
        version: '1.0.0',
        author: 'BeamFlow Team'
    }
};

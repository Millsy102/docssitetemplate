const fs = require('fs-extra');
const path = require('path');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

class BeamWidgetManager {
    constructor() {
        this.widgets = new Map();
        this.widgetDir = path.join(__dirname, 'components');
        this.ensureWidgetDirectory();
        this.loadWidgets();
    }

    ensureWidgetDirectory() {
        if (!fs.existsSync(this.widgetDir)) {
            fs.mkdirpSync(this.widgetDir);
        }
    }

    async loadWidgets() {
        try {
            const widgetFiles = await fs.readdir(this.widgetDir);
            
            for (const file of widgetFiles) {
                if (file.endsWith('.js')) {
                    const widgetPath = path.join(this.widgetDir, file);
                    const widget = require(widgetPath);
                    
                    if (widget.name && widget.render) {
                        this.widgets.set(widget.name, widget);
                        console.log(`Widget loaded: ${widget.name}`);
                    }
                }
            }

            console.log(`Loaded ${this.widgets.size} widgets`);
            BeamPerformanceMonitor.recordWidgetLoad(this.widgets.size);
            
        } catch (error) {
            BeamErrorHandler.logError('Widget Loading Error', error);
        }
    }

    getWidget(name) {
        return this.widgets.get(name);
    }

    getAllWidgets() {
        return Array.from(this.widgets.values());
    }

    getWidgetNames() {
        return Array.from(this.widgets.keys());
    }

    async renderWidget(name, data = {}) {
        const widget = this.getWidget(name);
        if (!widget) {
            throw new Error(`Widget '${name}' not found`);
        }

        try {
            return await widget.render(data);
        } catch (error) {
            BeamErrorHandler.logError(`Widget Render Error: ${name}`, error);
            return `<div class="widget-error">Error rendering widget: ${name}</div>`;
        }
    }

    getWidgetCSS(name) {
        const widget = this.getWidget(name);
        return widget ? widget.css || '' : '';
    }

    getAllWidgetCSS() {
        let css = '';
        for (const widget of this.widgets.values()) {
            if (widget.css) {
                css += widget.css + '\n';
            }
        }
        return css;
    }

    getWidgetStats() {
        return {
            total: this.widgets.size,
            names: this.getWidgetNames()
        };
    }
}

module.exports = new BeamWidgetManager();

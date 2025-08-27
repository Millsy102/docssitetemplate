const BeamWidgetManager = require('./BeamWidgetManager');

class WidgetShowcase {
    constructor() {
        this.widgets = [
            {
                name: 'SystemStatusWidget',
                title: 'System Status Dashboard',
                description: 'Real-time system monitoring with CPU, memory, and performance metrics',
                category: 'monitoring',
                features: ['Real-time metrics', 'Performance charts', 'System alerts', 'Responsive design'],
                icon: ''
            },
            {
                name: 'AnalyticsDashboardWidget',
                title: 'Analytics Dashboard',
                description: 'Advanced analytics with charts, metrics, and real-time data visualization',
                category: 'analytics',
                features: ['Interactive charts', 'Traffic analysis', 'User metrics', 'Real-time updates'],
                icon: ''
            },
            {
                name: 'UserManagementWidget',
                title: 'User Management',
                description: 'Comprehensive user management with profiles, roles, and permissions',
                category: 'user-management',
                features: ['User profiles', 'Role management', 'Search & filter', 'Bulk actions'],
                icon: ''
            },
            {
                name: 'NotificationCenterWidget',
                title: 'Notification Center',
                description: 'Modern notification system with categories and interactive features',
                category: 'notifications',
                features: ['Real-time notifications', 'Category filtering', 'Mark as read', 'Settings'],
                icon: ''
            },
            {
                name: 'PluginMarketplaceWidget',
                title: 'Plugin Marketplace',
                description: 'Plugin browsing, installation, and management system',
                category: 'plugins',
                features: ['Plugin browsing', 'Installation', 'Ratings & reviews', 'Categories'],
                icon: ''
            },
            {
                name: 'FileManagerWidget',
                title: 'File Manager',
                description: 'Modern file management with drag-and-drop and visual browser',
                category: 'files',
                features: ['Drag & drop', 'File browser', 'Upload zones', 'Context menus'],
                icon: ''
            }
        ];
    }

    getShowcaseHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>BeamFlow Widget Showcase</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        color: white;
                    }

                    .showcase-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .showcase-header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding: 40px 20px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .showcase-title {
                        font-size: 48px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    }

                    .showcase-subtitle {
                        font-size: 20px;
                        opacity: 0.9;
                        margin-bottom: 20px;
                    }

                    .showcase-description {
                        font-size: 16px;
                        opacity: 0.8;
                        max-width: 600px;
                        margin: 0 auto;
                        line-height: 1.6;
                    }

                    .widgets-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        gap: 30px;
                        margin-bottom: 40px;
                    }

                    .widget-card {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 30px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }

                    .widget-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                        background: rgba(255, 255, 255, 0.15);
                    }

                    .widget-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                    }

                    .widget-icon {
                        font-size: 32px;
                        margin-right: 15px;
                        width: 60px;
                        height: 60px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .widget-info h3 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }

                    .widget-category {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        display: inline-block;
                    }

                    .widget-description {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        opacity: 0.9;
                    }

                    .widget-features {
                        margin-bottom: 25px;
                    }

                    .features-title {
                        font-size: 14px;
                        font-weight: 600;
                        margin-bottom: 10px;
                        opacity: 0.8;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .features-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .feature-tag {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 6px 12px;
                        border-radius: 15px;
                        font-size: 12px;
                        font-weight: 600;
                    }

                    .widget-actions {
                        display: flex;
                        gap: 10px;
                    }

                    .action-btn {
                        flex: 1;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        border-radius: 10px;
                        padding: 12px 20px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-weight: 600;
                        font-size: 14px;
                    }

                    .action-btn:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-2px);
                    }

                    .action-btn.primary {
                        background: linear-gradient(45deg, #4ade80, #22c55e);
                    }

                    .action-btn.primary:hover {
                        background: linear-gradient(45deg, #22c55e, #16a34a);
                    }

                    .widget-preview {
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 15px;
                        padding: 20px;
                        margin-top: 20px;
                        min-height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        opacity: 0.7;
                    }

                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        display: none;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 20px;
                    }

                    .modal-content {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 20px;
                        padding: 30px;
                        color: white;
                        max-width: 90vw;
                        max-height: 90vh;
                        overflow-y: auto;
                        position: relative;
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }

                    .modal-title {
                        font-size: 24px;
                        font-weight: 700;
                    }

                    .modal-close {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 10px;
                        border-radius: 50%;
                        transition: background 0.3s ease;
                    }

                    .modal-close:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }

                    .widget-container {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 20px;
                    }

                    .stats-bar {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin-bottom: 30px;
                    }

                    .stat-item {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 15px;
                        text-align: center;
                    }

                    .stat-value {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }

                    .stat-label {
                        font-size: 12px;
                        opacity: 0.8;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    @media (max-width: 768px) {
                        .widgets-grid {
                            grid-template-columns: 1fr;
                        }
                        
                        .showcase-title {
                            font-size: 32px;
                        }
                        
                        .widget-actions {
                            flex-direction: column;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="showcase-container">
                    <div class="showcase-header">
                        <h1 class="showcase-title"> BeamFlow Widget Showcase</h1>
                        <p class="showcase-subtitle">Modern, Interactive Components for Your Private System</p>
                        <p class="showcase-description">
                            Discover our collection of beautiful, functional widgets designed to enhance your private system's interface. 
                            Each widget is built with modern design principles, responsive layouts, and interactive features.
                        </p>
                    </div>

                    <div class="stats-bar">
                        <div class="stat-item">
                            <div class="stat-value">${this.widgets.length}</div>
                            <div class="stat-label">Available Widgets</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">6</div>
                            <div class="stat-label">Categories</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">100%</div>
                            <div class="stat-label">Responsive</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">Modern</div>
                            <div class="stat-label">Design</div>
                        </div>
                    </div>

                    <div class="widgets-grid">
                        ${this.widgets.map(widget => `
                            <div class="widget-card" onclick="showWidget('${widget.name}')">
                                <div class="widget-header">
                                    <div class="widget-icon">${widget.icon}</div>
                                    <div class="widget-info">
                                        <h3>${widget.title}</h3>
                                        <span class="widget-category">${widget.category}</span>
                                    </div>
                                </div>
                                
                                <p class="widget-description">${widget.description}</p>
                                
                                <div class="widget-features">
                                    <div class="features-title">Key Features</div>
                                    <div class="features-list">
                                        ${widget.features.map(feature => `
                                            <span class="feature-tag">${feature}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="widget-actions">
                                    <button class="action-btn primary" onclick="event.stopPropagation(); showWidget('${widget.name}')">
                                         Preview
                                    </button>
                                    <button class="action-btn" onclick="event.stopPropagation(); getWidgetInfo('${widget.name}')">
                                        ℹ Info
                                    </button>
                                </div>
                                
                                <div class="widget-preview">
                                    Click to preview this widget
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Widget Preview Modal -->
                <div class="modal-overlay" id="widgetModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">Widget Preview</h2>
                            <button class="modal-close" onclick="closeModal()">&times;</button>
                        </div>
                        <div id="widgetContainer" class="widget-container">
                            <!-- Widget content will be loaded here -->
                        </div>
                    </div>
                </div>

                <script>
                    // Widget showcase JavaScript functionality
                    async function showWidget(widgetName) {
                        const modal = document.getElementById('widgetModal');
                        const container = document.getElementById('widgetContainer');
                        
                        // Show loading state
                        container.innerHTML = '<div style="text-align: center; padding: 40px;">Loading widget...</div>';
                        modal.style.display = 'flex';
                        
                        try {
                            // Fetch widget data based on type
                            let data = {};
                            switch(widgetName) {
                                case 'AnalyticsDashboardWidget':
                                    const analyticsResponse = await fetch('/admin/api/widgets/analytics/data');
                                    const analyticsData = await analyticsResponse.json();
                                    data = analyticsData.data;
                                    break;
                                case 'UserManagementWidget':
                                    const usersResponse = await fetch('/admin/api/widgets/users/data');
                                    const usersData = await usersResponse.json();
                                    data = usersData.data;
                                    break;
                                case 'NotificationCenterWidget':
                                    const notificationsResponse = await fetch('/admin/api/widgets/notifications/data');
                                    const notificationsData = await notificationsResponse.json();
                                    data = notificationsData.data;
                                    break;
                                case 'PluginMarketplaceWidget':
                                    const pluginsResponse = await fetch('/admin/api/widgets/plugins/data');
                                    const pluginsData = await pluginsResponse.json();
                                    data = pluginsData.data;
                                    break;
                            }
                            
                            // Render widget
                            const response = await fetch(\`/admin/api/widgets/\${widgetName}/render\`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + getAuthToken()
                                },
                                body: JSON.stringify({ data })
                            });
                            
                            const result = await response.json();
                            
                            if (result.success) {
                                container.innerHTML = result.html;
                                
                                // Load widget CSS
                                const cssResponse = await fetch('/admin/api/widgets/css', {
                                    headers: {
                                        'Authorization': 'Bearer ' + getAuthToken()
                                    }
                                });
                                
                                if (cssResponse.ok) {
                                    const css = await cssResponse.text();
                                    const style = document.createElement('style');
                                    style.textContent = css;
                                    document.head.appendChild(style);
                                }
                            } else {
                                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #f87171;">Failed to load widget</div>';
                            }
                        } catch (error) {
                            console.error('Error loading widget:', error);
                            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #f87171;">Error loading widget</div>';
                        }
                    }
                    
                    function getWidgetInfo(widgetName) {
                        const widget = widgets.find(w => w.name === widgetName);
                        if (widget) {
                            alert(\`Widget: \${widget.title}\\n\\nDescription: \${widget.description}\\n\\nFeatures:\\n\${widget.features.join('\\n• ')}\`);
                        }
                    }
                    
                    function closeModal() {
                        document.getElementById('widgetModal').style.display = 'none';
                    }
                    
                    function getAuthToken() {
                        // In a real implementation, this would get the auth token from your auth system
                        return 'demo-token';
                    }
                    
                    // Close modal when clicking outside
                    document.addEventListener('click', (e) => {
                        if (e.target.classList.contains('modal-overlay')) {
                            closeModal();
                        }
                    });
                    
                    // Add some interactive effects
                    document.querySelectorAll('.widget-card').forEach(card => {
                        card.addEventListener('mouseenter', () => {
                            card.style.transform = 'translateY(-10px) scale(1.02)';
                        });
                        
                        card.addEventListener('mouseleave', () => {
                            card.style.transform = 'translateY(0) scale(1)';
                        });
                    });
                </script>
            </body>
            </html>
        `;
    }

    getWidgets() {
        return this.widgets;
    }

    getWidgetByName(name) {
        return this.widgets.find(widget => widget.name === name);
    }
}

module.exports = new WidgetShowcase();

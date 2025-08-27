const BeamPerformanceMonitor = require('../../utils/BeamPerformanceMonitor');

module.exports = {
    name: 'SystemStatusWidget',
    description: 'Real-time system status with CPU, memory, and performance metrics',
    version: '1.0.0',
    
    css: `
        .system-status-widget {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 300px;
        }

        .system-status-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }

        .system-status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .system-status-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .system-status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4ade80;
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }

        .system-metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }

        .metric-value {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .metric-label {
            font-size: 14px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .metric-unit {
            font-size: 12px;
            opacity: 0.7;
        }

        .system-charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            position: relative;
            z-index: 1;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chart-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4ade80, #22c55e);
            border-radius: 4px;
            transition: width 0.5s ease;
            position: relative;
        }

        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .chart-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            opacity: 0.8;
        }

        .system-alerts {
            margin-top: 20px;
            position: relative;
            z-index: 1;
        }

        .alert-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid #4ade80;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .alert-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4ade80;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .alert-content {
            flex: 1;
        }

        .alert-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .alert-message {
            font-size: 14px;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            .system-metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .system-charts {
                grid-template-columns: 1fr;
            }
        }
    `,

    async render(data = {}) {
        const stats = BeamPerformanceMonitor.getStats();
        const health = BeamPerformanceMonitor.getHealthStatus();
        
        const cpuUsage = Math.round(stats.cpu?.usage || 0);
        const memoryUsage = Math.round(stats.memory?.usage || 0);
        const uptime = Math.floor(process.uptime() / 3600);
        const responseTime = Math.round(stats.responseTime?.average || 0);
        
        const alerts = [];
        if (cpuUsage > 80) alerts.push({ type: 'warning', title: 'High CPU Usage', message: `${cpuUsage}% CPU usage detected` });
        if (memoryUsage > 85) alerts.push({ type: 'warning', title: 'High Memory Usage', message: `${memoryUsage}% memory usage detected` });
        if (responseTime > 1000) alerts.push({ type: 'error', title: 'Slow Response Time', message: `${responseTime}ms average response time` });

        return `
            <div class="system-status-widget">
                <div class="system-status-header">
                    <h3 class="system-status-title">System Status</h3>
                    <div class="system-status-indicator"></div>
                </div>
                
                <div class="system-metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${cpuUsage}%</div>
                        <div class="metric-label">CPU Usage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${memoryUsage}%</div>
                        <div class="metric-label">Memory Usage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${uptime}<span class="metric-unit">h</span></div>
                        <div class="metric-label">Uptime</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${responseTime}<span class="metric-unit">ms</span></div>
                        <div class="metric-label">Response Time</div>
                    </div>
                </div>
                
                <div class="system-charts">
                    <div class="chart-container">
                        <div class="chart-title">CPU Usage</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${cpuUsage}%"></div>
                        </div>
                        <div class="chart-labels">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Memory Usage</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${memoryUsage}%"></div>
                        </div>
                        <div class="chart-labels">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
                
                ${alerts.length > 0 ? `
                    <div class="system-alerts">
                        ${alerts.map(alert => `
                            <div class="alert-item">
                                <div class="alert-icon"></div>
                                <div class="alert-content">
                                    <div class="alert-title">${alert.title}</div>
                                    <div class="alert-message">${alert.message}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
};

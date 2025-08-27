const BeamPerformanceMonitor = require('../../utils/BeamPerformanceMonitor');

module.exports = {
    name: 'AnalyticsDashboardWidget',
    description: 'Advanced analytics dashboard with charts, metrics, and real-time data visualization',
    version: '1.0.0',
    
    css: `
        .analytics-dashboard-widget {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 500px;
        }

        .analytics-dashboard-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            pointer-events: none;
        }

        .analytics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .analytics-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .analytics-controls {
            display: flex;
            gap: 10px;
        }

        .time-filter {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }

        .refresh-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .refresh-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #00d4ff, #0099cc);
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .metric-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            background: rgba(255, 255, 255, 0.2);
        }

        .metric-trend {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
        }

        .metric-trend.positive {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .metric-trend.negative {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .metric-value {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .metric-label {
            font-size: 14px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .metric-change {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 5px;
        }

        .charts-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
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
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
        }

        .line-chart {
            height: 200px;
            position: relative;
            margin-bottom: 20px;
        }

        .chart-line {
            fill: none;
            stroke: #00d4ff;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .chart-area {
            fill: url(#gradient);
            opacity: 0.3;
        }

        .chart-points {
            fill: #00d4ff;
            stroke: white;
            stroke-width: 2;
        }

        .chart-axis {
            stroke: rgba(255, 255, 255, 0.3);
            stroke-width: 1;
        }

        .chart-labels {
            fill: rgba(255, 255, 255, 0.7);
            font-size: 12px;
        }

        .pie-chart {
            height: 200px;
            position: relative;
        }

        .pie-segment {
            transition: all 0.3s ease;
        }

        .pie-segment:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }

        .pie-legend {
            margin-top: 20px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }

        .recent-activity {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .activity-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
        }

        .activity-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .activity-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 14px;
        }

        .activity-content {
            flex: 1;
        }

        .activity-text {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .activity-time {
            font-size: 12px;
            opacity: 0.7;
        }

        .activity-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 10px;
        }

        .status-online {
            background: #4ade80;
        }

        .status-warning {
            background: #fbbf24;
        }

        .status-error {
            background: #f87171;
        }

        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `,

    async render(data = {}) {
        const stats = BeamPerformanceMonitor.getStats();
        
        // Generate sample data for demonstration
        const generateChartData = (points = 24) => {
            const data = [];
            for (let i = 0; i < points; i++) {
                data.push({
                    x: i,
                    y: Math.random() * 100 + 20
                });
            }
            return data;
        };

        const chartData = generateChartData();
        const pieData = [
            { label: 'Active Users', value: 45, color: '#00d4ff' },
            { label: 'Page Views', value: 30, color: '#ff6b6b' },
            { label: 'Downloads', value: 15, color: '#4ecdc4' },
            { label: 'API Calls', value: 10, color: '#45b7d1' }
        ];

        const activities = [
            { icon: '', text: 'New user registered', time: '2 min ago', status: 'online' },
            { icon: '', text: 'Document uploaded', time: '5 min ago', status: 'online' },
            { icon: '', text: 'System maintenance', time: '15 min ago', status: 'warning' },
            { icon: '', text: 'Analytics updated', time: '1 hour ago', status: 'online' },
            { icon: '', text: 'High CPU usage detected', time: '2 hours ago', status: 'error' }
        ];

        const chartPath = chartData.map((point, i) => 
            `${i === 0 ? 'M' : 'L'} ${(i / (chartData.length - 1)) * 100} ${100 - point.y}`
        ).join(' ');

        const areaPath = chartPath + ` L 100 100 L 0 100 Z`;

        return `
            <div class="analytics-dashboard-widget">
                <div class="analytics-header">
                    <h3 class="analytics-title">Analytics Dashboard</h3>
                    <div class="analytics-controls">
                        <select class="time-filter">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                        </select>
                        <button class="refresh-btn" onclick="refreshAnalytics()"></button>
                    </div>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <div class="metric-icon"></div>
                            <div class="metric-trend positive">+12%</div>
                        </div>
                        <div class="metric-value">1,247</div>
                        <div class="metric-label">Active Users</div>
                        <div class="metric-change">+134 from yesterday</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <div class="metric-icon"></div>
                            <div class="metric-trend positive">+8%</div>
                        </div>
                        <div class="metric-value">45.2K</div>
                        <div class="metric-label">Page Views</div>
                        <div class="metric-change">+3.4K from yesterday</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <div class="metric-icon"></div>
                            <div class="metric-trend negative">-3%</div>
                        </div>
                        <div class="metric-value">342ms</div>
                        <div class="metric-label">Avg Response Time</div>
                        <div class="metric-change">+12ms from yesterday</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <div class="metric-icon"></div>
                            <div class="metric-trend positive">+5%</div>
                        </div>
                        <div class="metric-value">78%</div>
                        <div class="metric-label">System Uptime</div>
                        <div class="metric-change">+2% from yesterday</div>
                    </div>
                </div>
                
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-title">Traffic Overview</div>
                        <svg class="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
                                    <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.1" />
                                </linearGradient>
                            </defs>
                            <path class="chart-area" d="${areaPath}"/>
                            <path class="chart-line" d="${chartPath}"/>
                            ${chartData.map((point, i) => `
                                <circle class="chart-points" 
                                    cx="${(i / (chartData.length - 1)) * 100}" 
                                    cy="${100 - point.y}" 
                                    r="2"/>
                            `).join('')}
                            <line class="chart-axis" x1="0" y1="100" x2="100" y2="100"/>
                            <line class="chart-axis" x1="0" y1="0" x2="0" y2="100"/>
                        </svg>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-title">Traffic Sources</div>
                        <svg class="pie-chart" viewBox="0 0 100 100">
                            ${(() => {
                                let currentAngle = 0;
                                const total = pieData.reduce((sum, item) => sum + item.value, 0);
                                return pieData.map((item, i) => {
                                    const angle = (item.value / total) * 360;
                                    const x1 = 50 + 30 * Math.cos(currentAngle * Math.PI / 180);
                                    const y1 = 50 + 30 * Math.sin(currentAngle * Math.PI / 180);
                                    const x2 = 50 + 30 * Math.cos((currentAngle + angle) * Math.PI / 180);
                                    const y2 = 50 + 30 * Math.sin((currentAngle + angle) * Math.PI / 180);
                                    
                                    const largeArcFlag = angle > 180 ? 1 : 0;
                                    const path = [
                                        `M 50 50`,
                                        `L ${x1} ${y1}`,
                                        `A 30 30 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                        'Z'
                                    ].join(' ');
                                    
                                    currentAngle += angle;
                                    
                                    return `<path class="pie-segment" d="${path}" fill="${item.color}"/>`;
                                }).join('');
                            })()}
                        </svg>
                        <div class="pie-legend">
                            ${pieData.map(item => `
                                <div class="legend-item">
                                    <div class="legend-color" style="background: ${item.color}"></div>
                                    <span>${item.label} (${item.value}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <div class="activity-title">Recent Activity</div>
                    <div class="activity-list">
                        ${activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-icon">${activity.icon}</div>
                                <div class="activity-content">
                                    <div class="activity-text">${activity.text}</div>
                                    <div class="activity-time">${activity.time}</div>
                                </div>
                                <div class="activity-status status-${activity.status}"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <script>
                function refreshAnalytics() {
                    // Implementation for refreshing analytics data
                    console.log('Refreshing analytics...');
                    // Add real-time data fetching logic here
                }
                
                // Auto-refresh every 30 seconds
                setInterval(refreshAnalytics, 30000);
            </script>
        `;
    }
};

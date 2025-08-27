module.exports = {
    name: 'NotificationCenterWidget',
    description: 'Modern notification center with real-time notifications, categories, and interactive features',
    version: '1.0.0',
    
    css: `
        .notification-center-widget {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 500px;
        }

        .notification-center-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="waves" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 0 10 Q 5 5, 10 10 T 20 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23waves)"/></svg>');
            pointer-events: none;
        }

        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .notification-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .notification-actions {
            display: flex;
            gap: 10px;
        }

        .action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 10px;
            padding: 10px 15px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-weight: 600;
            font-size: 14px;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .notification-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
        }

        .stat-value {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .stat-label {
            font-size: 12px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .notification-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            flex-wrap: wrap;
        }

        .filter-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 8px 16px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }

        .filter-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .filter-btn.active {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .notification-list {
            max-height: 400px;
            overflow-y: auto;
            position: relative;
            z-index: 1;
        }

        .notification-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .notification-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.15);
        }

        .notification-item.unread {
            border-left: 4px solid #4ade80;
            background: rgba(255, 255, 255, 0.15);
        }

        .notification-item.unread::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #4ade80, #22c55e);
        }

        .notification-header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            margin-right: 15px;
            flex-shrink: 0;
        }

        .notification-icon.info {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }

        .notification-icon.success {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .notification-icon.warning {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }

        .notification-icon.error {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .notification-content {
            flex: 1;
        }

        .notification-title-text {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
            line-height: 1.4;
        }

        .notification-message {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .notification-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            opacity: 0.7;
        }

        .notification-time {
            font-weight: 600;
        }

        .notification-category {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .notification-actions-row {
            display: flex;
            gap: 8px;
            margin-top: 15px;
        }

        .notification-action-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 11px;
            font-weight: 600;
        }

        .notification-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .notification-action-btn.primary {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .notification-action-btn.danger {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }

        .empty-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .empty-text {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .empty-subtext {
            font-size: 14px;
            opacity: 0.8;
        }

        .notification-settings {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
        }

        .settings-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }

        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .setting-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .setting-label {
            font-size: 14px;
            font-weight: 600;
        }

        .toggle-switch {
            position: relative;
            width: 50px;
            height: 24px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .toggle-switch.active {
            background: #4ade80;
        }

        .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }

        .toggle-switch.active::after {
            transform: translateX(26px);
        }

        @media (max-width: 768px) {
            .notification-filters {
                justify-content: center;
            }
            
            .notification-actions {
                flex-direction: column;
            }
            
            .notification-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `,

    async render(data = {}) {
        const notifications = data.notifications || [
            {
                id: 1,
                type: 'success',
                title: 'System Update Complete',
                message: 'The latest system update has been successfully installed. All services are running optimally.',
                time: '2 minutes ago',
                category: 'system',
                unread: true,
                icon: ''
            },
            {
                id: 2,
                type: 'info',
                title: 'New User Registration',
                message: 'A new user has registered: john.doe@example.com. Please review their account.',
                time: '15 minutes ago',
                category: 'user',
                unread: true,
                icon: ''
            },
            {
                id: 3,
                type: 'warning',
                title: 'High CPU Usage Detected',
                message: 'CPU usage has exceeded 80% for the past 10 minutes. Consider investigating.',
                time: '1 hour ago',
                category: 'monitoring',
                unread: false,
                icon: ''
            },
            {
                id: 4,
                type: 'error',
                title: 'Database Connection Failed',
                message: 'Failed to connect to the primary database. Attempting to reconnect...',
                time: '2 hours ago',
                category: 'system',
                unread: false,
                icon: ''
            },
            {
                id: 5,
                type: 'info',
                title: 'Backup Completed',
                message: 'Daily backup has been completed successfully. 2.3GB of data backed up.',
                time: '3 hours ago',
                category: 'backup',
                unread: false,
                icon: ''
            }
        ];

        const stats = {
            total: notifications.length,
            unread: notifications.filter(n => n.unread).length,
            today: notifications.filter(n => n.time.includes('minute') || n.time.includes('hour')).length,
            categories: [...new Set(notifications.map(n => n.category))].length
        };

        const categories = ['all', 'system', 'user', 'monitoring', 'backup', 'security'];

        return `
            <div class="notification-center-widget">
                <div class="notification-header">
                    <h3 class="notification-title">Notification Center</h3>
                    <div class="notification-actions">
                        <button class="action-btn" onclick="markAllAsRead()"> Mark All Read</button>
                        <button class="action-btn" onclick="clearAll()"> Clear All</button>
                        <button class="action-btn" onclick="showSettings()"> Settings</button>
                    </div>
                </div>
                
                <div class="notification-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.unread}</div>
                        <div class="stat-label">Unread</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.today}</div>
                        <div class="stat-label">Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.categories}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
                
                <div class="notification-filters">
                    ${categories.map(category => `
                        <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                                onclick="filterNotifications('${category}')">
                            ${category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    `).join('')}
                </div>
                
                <div class="notification-list">
                    ${notifications.length > 0 ? notifications.map(notification => `
                        <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                            <div class="notification-header-row">
                                <div class="notification-icon ${notification.type}">${notification.icon}</div>
                                <div class="notification-content">
                                    <div class="notification-title-text">${notification.title}</div>
                                    <div class="notification-message">${notification.message}</div>
                                    <div class="notification-meta">
                                        <span class="notification-time">${notification.time}</span>
                                        <span class="notification-category">${notification.category}</span>
                                    </div>
                                </div>
                                ${notification.unread ? '<div class="notification-badge">!</div>' : ''}
                            </div>
                            
                            <div class="notification-actions-row">
                                ${notification.unread ? 
                                    `<button class="notification-action-btn primary" onclick="markAsRead(${notification.id})">Mark Read</button>` : 
                                    `<button class="notification-action-btn" onclick="markAsUnread(${notification.id})">Mark Unread</button>`
                                }
                                <button class="notification-action-btn" onclick="viewDetails(${notification.id})">View Details</button>
                                <button class="notification-action-btn danger" onclick="deleteNotification(${notification.id})">Delete</button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <div class="empty-icon"></div>
                            <div class="empty-text">No notifications</div>
                            <div class="empty-subtext">You're all caught up!</div>
                        </div>
                    `}
                </div>
                
                <div class="notification-settings" id="notificationSettings" style="display: none;">
                    <div class="settings-title">Notification Settings</div>
                    <div class="settings-grid">
                        <div class="setting-item">
                            <span class="setting-label">System Notifications</span>
                            <div class="toggle-switch active" onclick="toggleSetting(this, 'system')"></div>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">User Notifications</span>
                            <div class="toggle-switch active" onclick="toggleSetting(this, 'user')"></div>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">Monitoring Alerts</span>
                            <div class="toggle-switch active" onclick="toggleSetting(this, 'monitoring')"></div>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">Backup Notifications</span>
                            <div class="toggle-switch" onclick="toggleSetting(this, 'backup')"></div>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">Email Notifications</span>
                            <div class="toggle-switch active" onclick="toggleSetting(this, 'email')"></div>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">Push Notifications</span>
                            <div class="toggle-switch" onclick="toggleSetting(this, 'push')"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Notification center JavaScript functionality
                let currentFilter = 'all';
                
                function filterNotifications(category) {
                    currentFilter = category;
                    
                    // Update filter buttons
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    
                    // Filter notifications
                    const notifications = document.querySelectorAll('.notification-item');
                    notifications.forEach(item => {
                        const categoryElement = item.querySelector('.notification-category');
                        const categoryText = categoryElement ? categoryElement.textContent.toLowerCase() : '';
                        
                        if (category === 'all' || categoryText === category) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
                
                function markAsRead(notificationId) {
                    const notification = document.querySelector(\`[data-id="\${notificationId}"]\`);
                    notification.classList.remove('unread');
                    notification.querySelector('.notification-badge')?.remove();
                    
                    // Update unread count
                    updateUnreadCount();
                    console.log('Marked as read:', notificationId);
                }
                
                function markAsUnread(notificationId) {
                    const notification = document.querySelector(\`[data-id="\${notificationId}"]\`);
                    notification.classList.add('unread');
                    
                    // Add badge if not exists
                    if (!notification.querySelector('.notification-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'notification-badge';
                        badge.textContent = '!';
                        notification.appendChild(badge);
                    }
                    
                    updateUnreadCount();
                    console.log('Marked as unread:', notificationId);
                }
                
                function markAllAsRead() {
                    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
                    unreadNotifications.forEach(notification => {
                        notification.classList.remove('unread');
                        notification.querySelector('.notification-badge')?.remove();
                    });
                    
                    updateUnreadCount();
                    console.log('Marked all as read');
                }
                
                function clearAll() {
                    if (confirm('Are you sure you want to clear all notifications?')) {
                        const notifications = document.querySelectorAll('.notification-item');
                        notifications.forEach(notification => {
                            notification.style.animation = 'fadeOut 0.3s ease';
                            setTimeout(() => notification.remove(), 300);
                        });
                        
                        updateUnreadCount();
                        console.log('Cleared all notifications');
                    }
                }
                
                function deleteNotification(notificationId) {
                    const notification = document.querySelector(\`[data-id="\${notificationId}"]\`);
                    notification.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                    
                    updateUnreadCount();
                    console.log('Deleted notification:', notificationId);
                }
                
                function viewDetails(notificationId) {
                    console.log('Viewing details for notification:', notificationId);
                    // Implementation for viewing notification details
                }
                
                function showSettings() {
                    const settings = document.getElementById('notificationSettings');
                    settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
                }
                
                function toggleSetting(element, setting) {
                    element.classList.toggle('active');
                    console.log('Toggled setting:', setting, element.classList.contains('active'));
                }
                
                function updateUnreadCount() {
                    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
                    const unreadStat = document.querySelector('.stat-card:nth-child(2) .stat-value');
                    if (unreadStat) {
                        unreadStat.textContent = unreadCount;
                    }
                }
                
                // Auto-refresh notifications every 30 seconds
                setInterval(() => {
                    console.log('Checking for new notifications...');
                    // Implementation for checking new notifications
                }, 30000);
                
                // Add CSS animation for fadeOut
                const style = document.createElement('style');
                style.textContent = \`
                    @keyframes fadeOut {
                        from { opacity: 1; transform: translateY(0); }
                        to { opacity: 0; transform: translateY(-10px); }
                    }
                \`;
                document.head.appendChild(style);
            </script>
        `;
    }
};

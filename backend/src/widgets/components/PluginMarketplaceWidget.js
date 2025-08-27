module.exports = {
    name: 'PluginMarketplaceWidget',
    description: 'Modern plugin marketplace with browsing, installation, and management features',
    version: '1.0.0',
    
    css: `
        .plugin-marketplace-widget {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 600px;
        }

        .plugin-marketplace-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hexagons" width="20" height="20" patternUnits="userSpaceOnUse"><polygon points="10,1 19,5.5 19,14.5 10,19 1,14.5 1,5.5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23hexagons)"/></svg>');
            pointer-events: none;
        }

        .marketplace-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .marketplace-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .marketplace-actions {
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

        .action-btn.primary {
            background: linear-gradient(45deg, #4ade80, #22c55e);
        }

        .marketplace-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
            font-size: 28px;
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

        .marketplace-controls {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .search-box {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 12px 15px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }

        .search-box::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .filter-select {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 12px 15px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(10px);
            min-width: 120px;
        }

        .category-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            flex-wrap: wrap;
        }

        .category-btn {
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

        .category-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .category-btn.active {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .plugins-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            position: relative;
            z-index: 1;
        }

        .plugin-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .plugin-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.15);
        }

        .plugin-card.featured::before {
            content: '⭐ Featured';
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
        }

        .plugin-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .plugin-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-right: 15px;
            flex-shrink: 0;
        }

        .plugin-info {
            flex: 1;
        }

        .plugin-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .plugin-author {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .plugin-version {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }

        .plugin-description {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
            opacity: 0.9;
        }

        .plugin-tags {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }

        .plugin-tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .plugin-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }

        .plugin-stat {
            text-align: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .plugin-stat-value {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 2px;
        }

        .plugin-stat-label {
            font-size: 10px;
            opacity: 0.7;
            text-transform: uppercase;
        }

        .plugin-actions {
            display: flex;
            gap: 8px;
        }

        .plugin-action-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            padding: 10px 12px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
            font-weight: 600;
        }

        .plugin-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .plugin-action-btn.install {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .plugin-action-btn.install:hover {
            background: rgba(34, 197, 94, 0.3);
        }

        .plugin-action-btn.update {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }

        .plugin-action-btn.update:hover {
            background: rgba(59, 130, 246, 0.3);
        }

        .plugin-action-btn.remove {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .plugin-action-btn.remove:hover {
            background: rgba(239, 68, 68, 0.3);
        }

        .plugin-action-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .plugin-action-btn.disabled:hover {
            transform: none;
        }

        .rating {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 10px;
        }

        .stars {
            display: flex;
            gap: 2px;
        }

        .star {
            color: #fbbf24;
            font-size: 14px;
        }

        .star.empty {
            color: rgba(255, 255, 255, 0.3);
        }

        .rating-count {
            font-size: 12px;
            opacity: 0.7;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
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
            font-size: 20px;
            font-weight: 700;
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .plugin-details {
            margin-bottom: 20px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-label {
            font-weight: 600;
            opacity: 0.8;
        }

        .detail-value {
            font-weight: 400;
        }

        .changelog {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .changelog-title {
            font-weight: 600;
            margin-bottom: 10px;
        }

        .changelog-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .changelog-item {
            padding: 5px 0;
            font-size: 14px;
            opacity: 0.9;
        }

        .changelog-item::before {
            content: '•';
            margin-right: 8px;
            color: #4ade80;
        }

        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .btn-primary {
            background: linear-gradient(45deg, #4ade80, #22c55e);
            color: white;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .plugins-grid {
                grid-template-columns: 1fr;
            }
            
            .marketplace-controls {
                flex-direction: column;
            }
            
            .marketplace-actions {
                flex-direction: column;
            }
            
            .marketplace-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `,

    async render(data = {}) {
        const plugins = data.plugins || [
            {
                id: 1,
                name: 'Advanced Analytics',
                author: 'BeamFlow Team',
                version: '2.1.0',
                description: 'Comprehensive analytics and reporting plugin with real-time dashboards and custom metrics.',
                category: 'analytics',
                tags: ['analytics', 'dashboard', 'reports'],
                rating: 4.8,
                ratingCount: 156,
                downloads: 1247,
                size: '2.3 MB',
                featured: true,
                installed: false,
                icon: ''
            },
            {
                id: 2,
                name: 'Security Scanner',
                author: 'Security Labs',
                version: '1.5.2',
                description: 'Advanced security scanning and vulnerability detection for your system.',
                category: 'security',
                tags: ['security', 'scanner', 'vulnerability'],
                rating: 4.9,
                ratingCount: 89,
                downloads: 892,
                size: '1.8 MB',
                featured: false,
                installed: true,
                icon: ''
            },
            {
                id: 3,
                name: 'Backup Manager',
                author: 'DataSafe Inc',
                version: '3.0.1',
                description: 'Automated backup management with cloud storage integration and scheduling.',
                category: 'backup',
                tags: ['backup', 'cloud', 'automation'],
                rating: 4.7,
                ratingCount: 234,
                downloads: 2156,
                size: '3.1 MB',
                featured: false,
                installed: false,
                icon: ''
            },
            {
                id: 4,
                name: 'User Management Pro',
                author: 'AdminTools',
                version: '2.0.0',
                description: 'Enhanced user management with advanced permissions and role-based access control.',
                category: 'user-management',
                tags: ['users', 'permissions', 'roles'],
                rating: 4.6,
                ratingCount: 178,
                downloads: 1567,
                size: '2.7 MB',
                featured: true,
                installed: false,
                icon: ''
            },
            {
                id: 5,
                name: 'Performance Monitor',
                author: 'SystemWatch',
                version: '1.8.3',
                description: 'Real-time performance monitoring with alerts and optimization recommendations.',
                category: 'monitoring',
                tags: ['performance', 'monitoring', 'alerts'],
                rating: 4.5,
                ratingCount: 145,
                downloads: 1234,
                size: '1.9 MB',
                featured: false,
                installed: true,
                icon: ''
            },
            {
                id: 6,
                name: 'API Gateway',
                author: 'ConnectPro',
                version: '2.2.1',
                description: 'Advanced API gateway with rate limiting, authentication, and request routing.',
                category: 'api',
                tags: ['api', 'gateway', 'routing'],
                rating: 4.4,
                ratingCount: 98,
                downloads: 876,
                size: '2.1 MB',
                featured: false,
                installed: false,
                icon: ''
            }
        ];

        const stats = {
            total: plugins.length,
            installed: plugins.filter(p => p.installed).length,
            featured: plugins.filter(p => p.featured).length,
            categories: [...new Set(plugins.map(p => p.category))].length
        };

        const categories = ['all', 'analytics', 'security', 'backup', 'user-management', 'monitoring', 'api'];

        const renderStars = (rating) => {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';
            
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    stars += '<span class="star"></span>';
                } else if (i === fullStars && hasHalfStar) {
                    stars += '<span class="star"></span>';
                } else {
                    stars += '<span class="star empty"></span>';
                }
            }
            return stars;
        };

        return `
            <div class="plugin-marketplace-widget">
                <div class="marketplace-header">
                    <h3 class="marketplace-title">Plugin Marketplace</h3>
                    <div class="marketplace-actions">
                        <button class="action-btn" onclick="refreshMarketplace()"> Refresh</button>
                        <button class="action-btn" onclick="showInstalled()"> Installed</button>
                        <button class="action-btn primary" onclick="uploadPlugin()"> Upload Plugin</button>
                    </div>
                </div>
                
                <div class="marketplace-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Plugins</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.installed}</div>
                        <div class="stat-label">Installed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.featured}</div>
                        <div class="stat-label">Featured</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.categories}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
                
                <div class="marketplace-controls">
                    <input type="text" class="search-box" placeholder="Search plugins..." onkeyup="searchPlugins(this.value)">
                    <select class="filter-select" onchange="sortPlugins(this.value)">
                        <option value="name">Sort by Name</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="downloads">Sort by Downloads</option>
                        <option value="date">Sort by Date</option>
                    </select>
                </div>
                
                <div class="category-filters">
                    ${categories.map(category => `
                        <button class="category-btn ${category === 'all' ? 'active' : ''}" 
                                onclick="filterByCategory('${category}')">
                            ${category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    `).join('')}
                </div>
                
                <div class="plugins-grid">
                    ${plugins.map(plugin => `
                        <div class="plugin-card ${plugin.featured ? 'featured' : ''}" data-id="${plugin.id}">
                            <div class="plugin-header">
                                <div class="plugin-icon">${plugin.icon}</div>
                                <div class="plugin-info">
                                    <div class="plugin-name">${plugin.name}</div>
                                    <div class="plugin-author">by ${plugin.author}</div>
                                    <div class="plugin-version">v${plugin.version}</div>
                                </div>
                            </div>
                            
                            <div class="rating">
                                <div class="stars">${renderStars(plugin.rating)}</div>
                                <div class="rating-count">(${plugin.ratingCount})</div>
                            </div>
                            
                            <div class="plugin-description">${plugin.description}</div>
                            
                            <div class="plugin-tags">
                                ${plugin.tags.map(tag => `<span class="plugin-tag">${tag}</span>`).join('')}
                            </div>
                            
                            <div class="plugin-stats">
                                <div class="plugin-stat">
                                    <div class="plugin-stat-value">${plugin.downloads}</div>
                                    <div class="plugin-stat-label">Downloads</div>
                                </div>
                                <div class="plugin-stat">
                                    <div class="plugin-stat-value">${plugin.size}</div>
                                    <div class="plugin-stat-label">Size</div>
                                </div>
                                <div class="plugin-stat">
                                    <div class="plugin-stat-value">${plugin.rating}</div>
                                    <div class="plugin-stat-label">Rating</div>
                                </div>
                            </div>
                            
                            <div class="plugin-actions">
                                ${plugin.installed ? `
                                    <button class="plugin-action-btn update" onclick="updatePlugin(${plugin.id})"> Update</button>
                                    <button class="plugin-action-btn" onclick="viewPlugin(${plugin.id})"> View</button>
                                    <button class="plugin-action-btn remove" onclick="removePlugin(${plugin.id})"> Remove</button>
                                ` : `
                                    <button class="plugin-action-btn install" onclick="installPlugin(${plugin.id})"> Install</button>
                                    <button class="plugin-action-btn" onclick="viewPlugin(${plugin.id})"> View</button>
                                    <button class="plugin-action-btn" onclick="addToWishlist(${plugin.id})"> Wishlist</button>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Plugin Details Modal -->
            <div class="modal-overlay" id="pluginModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Plugin Details</h3>
                        <button class="modal-close" onclick="closeModal('pluginModal')">&times;</button>
                    </div>
                    <div id="pluginModalContent">
                        <!-- Plugin details will be loaded here -->
                    </div>
                </div>
            </div>
            
            <script>
                // Plugin marketplace JavaScript functionality
                let currentCategory = 'all';
                let currentSort = 'name';
                
                function searchPlugins(query) {
                    const pluginCards = document.querySelectorAll('.plugin-card');
                    pluginCards.forEach(card => {
                        const pluginName = card.querySelector('.plugin-name').textContent.toLowerCase();
                        const pluginDesc = card.querySelector('.plugin-description').textContent.toLowerCase();
                        const pluginAuthor = card.querySelector('.plugin-author').textContent.toLowerCase();
                        
                        const matches = pluginName.includes(query.toLowerCase()) || 
                                      pluginDesc.includes(query.toLowerCase()) || 
                                      pluginAuthor.includes(query.toLowerCase());
                        
                        card.style.display = matches ? 'block' : 'none';
                    });
                }
                
                function filterByCategory(category) {
                    currentCategory = category;
                    
                    // Update category buttons
                    document.querySelectorAll('.category-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    
                    // Filter plugins
                    const pluginCards = document.querySelectorAll('.plugin-card');
                    pluginCards.forEach(card => {
                        // This would need to be implemented with actual category data
                        card.style.display = 'block';
                    });
                }
                
                function sortPlugins(sortBy) {
                    currentSort = sortBy;
                    console.log('Sorting plugins by:', sortBy);
                    // Implementation for sorting plugins
                }
                
                function installPlugin(pluginId) {
                    const button = event.target;
                    const originalText = button.textContent;
                    
                    button.innerHTML = '<span class="loading-spinner"></span> Installing...';
                    button.disabled = true;
                    button.classList.add('disabled');
                    
                    // Simulate installation
                    setTimeout(() => {
                        button.textContent = ' Installed';
                        button.classList.remove('install', 'disabled');
                        button.classList.add('update');
                        button.onclick = () => updatePlugin(pluginId);
                        
                        console.log('Plugin installed:', pluginId);
                    }, 2000);
                }
                
                function updatePlugin(pluginId) {
                    const button = event.target;
                    const originalText = button.textContent;
                    
                    button.innerHTML = '<span class="loading-spinner"></span> Updating...';
                    button.disabled = true;
                    button.classList.add('disabled');
                    
                    // Simulate update
                    setTimeout(() => {
                        button.textContent = ' Updated';
                        button.classList.remove('disabled');
                        
                        console.log('Plugin updated:', pluginId);
                    }, 2000);
                }
                
                function removePlugin(pluginId) {
                    if (confirm('Are you sure you want to remove this plugin?')) {
                        const card = document.querySelector(\`[data-id="\${pluginId}"]\`);
                        card.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => card.remove(), 300);
                        
                        console.log('Plugin removed:', pluginId);
                    }
                }
                
                function viewPlugin(pluginId) {
                    const modal = document.getElementById('pluginModal');
                    const content = document.getElementById('pluginModalContent');
                    
                    // Load plugin details
                    content.innerHTML = \`
                        <div class="plugin-details">
                            <div class="detail-row">
                                <span class="detail-label">Name:</span>
                                <span class="detail-value">Advanced Analytics</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Author:</span>
                                <span class="detail-value">BeamFlow Team</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Version:</span>
                                <span class="detail-value">2.1.0</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Size:</span>
                                <span class="detail-value">2.3 MB</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Downloads:</span>
                                <span class="detail-value">1,247</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Rating:</span>
                                <span class="detail-value">4.8/5 (156 reviews)</span>
                            </div>
                        </div>
                        
                        <div class="changelog">
                            <div class="changelog-title">What's New in v2.1.0</div>
                            <ul class="changelog-list">
                                <li class="changelog-item">Added real-time dashboard updates</li>
                                <li class="changelog-item">Improved performance monitoring</li>
                                <li class="changelog-item">Fixed bug with data export</li>
                                <li class="changelog-item">Added new chart types</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center;">
                            <button class="btn btn-primary" onclick="installPlugin(${pluginId})">Install Plugin</button>
                            <button class="btn btn-secondary" onclick="closeModal('pluginModal')">Close</button>
                        </div>
                    \`;
                    
                    modal.style.display = 'flex';
                    console.log('Viewing plugin:', pluginId);
                }
                
                function addToWishlist(pluginId) {
                    console.log('Added to wishlist:', pluginId);
                    // Implementation for adding to wishlist
                }
                
                function refreshMarketplace() {
                    console.log('Refreshing marketplace...');
                    // Implementation for refreshing marketplace
                }
                
                function showInstalled() {
                    console.log('Showing installed plugins...');
                    // Implementation for showing installed plugins
                }
                
                function uploadPlugin() {
                    console.log('Uploading plugin...');
                    // Implementation for uploading plugin
                }
                
                function closeModal(modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
                
                // Close modal when clicking outside
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('modal-overlay')) {
                        e.target.style.display = 'none';
                    }
                });
                
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

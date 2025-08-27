module.exports = {
    name: 'UserManagementWidget',
    description: 'Advanced user management with profiles, roles, permissions, and interactive features',
    version: '1.0.0',
    
    css: `
        .user-management-widget {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 600px;
        }

        .user-management-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23circles)"/></svg>');
            pointer-events: none;
        }

        .user-management-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .user-management-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .user-management-actions {
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

        .user-stats {
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

        .user-controls {
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

        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            position: relative;
            z-index: 1;
        }

        .user-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.15);
        }

        .user-card.online::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #4ade80, #22c55e);
        }

        .user-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .user-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
            margin-right: 15px;
            position: relative;
        }

        .user-avatar.online::after {
            content: '';
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background: #4ade80;
            border: 2px solid white;
            border-radius: 50%;
        }

        .user-info {
            flex: 1;
        }

        .user-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .user-email {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .user-role {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }

        .user-role.admin {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .user-role.moderator {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }

        .user-role.user {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .user-stats-mini {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }

        .stat-mini {
            text-align: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        .stat-mini-value {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 2px;
        }

        .stat-mini-label {
            font-size: 10px;
            opacity: 0.7;
            text-transform: uppercase;
        }

        .user-actions {
            display: flex;
            gap: 8px;
        }

        .user-action-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
            font-weight: 600;
        }

        .user-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
        }

        .user-action-btn.danger {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .user-action-btn.danger:hover {
            background: rgba(239, 68, 68, 0.3);
        }

        .user-action-btn.success {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .user-action-btn.success:hover {
            background: rgba(34, 197, 94, 0.3);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            max-width: 500px;
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

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .form-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }

        .form-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .form-select {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }

        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 25px;
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

        @media (max-width: 768px) {
            .users-grid {
                grid-template-columns: 1fr;
            }
            
            .user-controls {
                flex-direction: column;
            }
            
            .user-management-actions {
                flex-direction: column;
            }
        }
    `,

    async render(data = {}) {
        const users = data.users || [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
                status: 'online',
                avatar: 'JD',
                stats: { posts: 45, comments: 123, lastSeen: '2 min ago' }
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'moderator',
                status: 'online',
                avatar: 'JS',
                stats: { posts: 23, comments: 89, lastSeen: '5 min ago' }
            },
            {
                id: 3,
                name: 'Bob Wilson',
                email: 'bob@example.com',
                role: 'user',
                status: 'offline',
                avatar: 'BW',
                stats: { posts: 12, comments: 34, lastSeen: '1 hour ago' }
            },
            {
                id: 4,
                name: 'Alice Brown',
                email: 'alice@example.com',
                role: 'user',
                status: 'online',
                avatar: 'AB',
                stats: { posts: 8, comments: 56, lastSeen: '10 min ago' }
            }
        ];

        const stats = {
            total: users.length,
            online: users.filter(u => u.status === 'online').length,
            admins: users.filter(u => u.role === 'admin').length,
            active: users.filter(u => u.stats.posts > 10).length
        };

        return `
            <div class="user-management-widget">
                <div class="user-management-header">
                    <h3 class="user-management-title">User Management</h3>
                    <div class="user-management-actions">
                        <button class="action-btn" onclick="exportUsers()"> Export</button>
                        <button class="action-btn" onclick="bulkActions()"> Bulk Actions</button>
                        <button class="action-btn primary" onclick="showAddUserModal()"> Add User</button>
                    </div>
                </div>
                
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.online}</div>
                        <div class="stat-label">Online Now</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.admins}</div>
                        <div class="stat-label">Administrators</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.active}</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                </div>
                
                <div class="user-controls">
                    <input type="text" class="search-box" placeholder="Search users..." onkeyup="searchUsers(this.value)">
                    <select class="filter-select" onchange="filterUsers(this.value)">
                        <option value="">All Roles</option>
                        <option value="admin">Administrators</option>
                        <option value="moderator">Moderators</option>
                        <option value="user">Users</option>
                    </select>
                    <select class="filter-select" onchange="filterByStatus(this.value)">
                        <option value="">All Status</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>
                
                <div class="users-grid">
                    ${users.map(user => `
                        <div class="user-card ${user.status === 'online' ? 'online' : ''}" data-user-id="${user.id}">
                            <div class="user-header">
                                <div class="user-avatar ${user.status === 'online' ? 'online' : ''}">${user.avatar}</div>
                                <div class="user-info">
                                    <div class="user-name">${user.name}</div>
                                    <div class="user-email">${user.email}</div>
                                    <div class="user-role ${user.role}">${user.role}</div>
                                </div>
                            </div>
                            
                            <div class="user-stats-mini">
                                <div class="stat-mini">
                                    <div class="stat-mini-value">${user.stats.posts}</div>
                                    <div class="stat-mini-label">Posts</div>
                                </div>
                                <div class="stat-mini">
                                    <div class="stat-mini-value">${user.stats.comments}</div>
                                    <div class="stat-mini-label">Comments</div>
                                </div>
                                <div class="stat-mini">
                                    <div class="stat-mini-value">${user.stats.lastSeen}</div>
                                    <div class="stat-mini-label">Last Seen</div>
                                </div>
                            </div>
                            
                            <div class="user-actions">
                                <button class="user-action-btn" onclick="viewUser(${user.id})"> View</button>
                                <button class="user-action-btn success" onclick="editUser(${user.id})"> Edit</button>
                                <button class="user-action-btn" onclick="messageUser(${user.id})"> Message</button>
                                <button class="user-action-btn danger" onclick="deleteUser(${user.id})"> Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Add User Modal -->
            <div class="modal-overlay" id="addUserModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Add New User</h3>
                        <button class="modal-close" onclick="closeModal('addUserModal')">&times;</button>
                    </div>
                    <form onsubmit="addUser(event)">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-input" name="name" placeholder="Enter full name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" name="email" placeholder="Enter email address" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <select class="form-select" name="role" required>
                                <option value="">Select role</option>
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" name="password" placeholder="Enter password" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('addUserModal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <script>
                // User management JavaScript functionality
                function showAddUserModal() {
                    document.getElementById('addUserModal').style.display = 'flex';
                }
                
                function closeModal(modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
                
                function addUser(event) {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const userData = Object.fromEntries(formData);
                    
                    console.log('Adding user:', userData);
                    // Implementation for adding user
                    
                    closeModal('addUserModal');
                    event.target.reset();
                }
                
                function searchUsers(query) {
                    const userCards = document.querySelectorAll('.user-card');
                    userCards.forEach(card => {
                        const userName = card.querySelector('.user-name').textContent.toLowerCase();
                        const userEmail = card.querySelector('.user-email').textContent.toLowerCase();
                        const matches = userName.includes(query.toLowerCase()) || userEmail.includes(query.toLowerCase());
                        card.style.display = matches ? 'block' : 'none';
                    });
                }
                
                function filterUsers(role) {
                    const userCards = document.querySelectorAll('.user-card');
                    userCards.forEach(card => {
                        const userRole = card.querySelector('.user-role').textContent;
                        const matches = !role || userRole === role;
                        card.style.display = matches ? 'block' : 'none';
                    });
                }
                
                function filterByStatus(status) {
                    const userCards = document.querySelectorAll('.user-card');
                    userCards.forEach(card => {
                        const isOnline = card.classList.contains('online');
                        const matches = !status || (status === 'online' && isOnline) || (status === 'offline' && !isOnline);
                        card.style.display = matches ? 'block' : 'none';
                    });
                }
                
                function viewUser(userId) {
                    console.log('Viewing user:', userId);
                    // Implementation for viewing user details
                }
                
                function editUser(userId) {
                    console.log('Editing user:', userId);
                    // Implementation for editing user
                }
                
                function messageUser(userId) {
                    console.log('Messaging user:', userId);
                    // Implementation for messaging user
                }
                
                function deleteUser(userId) {
                    if (confirm('Are you sure you want to delete this user?')) {
                        console.log('Deleting user:', userId);
                        // Implementation for deleting user
                    }
                }
                
                function exportUsers() {
                    console.log('Exporting users...');
                    // Implementation for exporting users
                }
                
                function bulkActions() {
                    console.log('Bulk actions...');
                    // Implementation for bulk actions
                }
                
                // Close modal when clicking outside
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('modal-overlay')) {
                        e.target.style.display = 'none';
                    }
                });
            </script>
        `;
    }
};

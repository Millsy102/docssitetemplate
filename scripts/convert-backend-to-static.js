const fs = require('fs').promises;
const path = require('path');

async function convertExpressToStatic() {
  console.log('🔄 Converting Express.js backend to static files...');
  
  const apiDir = 'dist/admin/api';
  
  try {
    // Create API directory
    await fs.mkdir(apiDir, { recursive: true });
    
    // Convert /api/auth to static auth.json
    const authData = {
      endpoints: {
        login: '/admin/api/auth/login.json',
        logout: '/admin/api/auth/logout.json',
        verify: '/admin/api/auth/verify.json'
      },
      config: {
        requireAuth: true,
        sessionTimeout: 3600,
        maxLoginAttempts: 3
      },
      status: 'active',
      timestamp: new Date().toISOString()
    };
    
    // Convert /api/users to static users.json
    const usersData = {
      users: [
        { 
          id: 1, 
          name: 'Admin', 
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
          lastLogin: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'User', 
          role: 'user',
          permissions: ['read'],
          lastLogin: null
        }
      ],
      permissions: {
        admin: ['read', 'write', 'delete', 'admin'],
        user: ['read'],
        guest: []
      },
      totalUsers: 2,
      timestamp: new Date().toISOString()
    };
    
    // Convert /api/files to static files.json
    const filesData = {
      files: [
        { 
          id: 1, 
          name: 'config.json', 
          type: 'config',
          size: 1024,
          modified: new Date().toISOString(),
          path: '/config/config.json'
        },
        { 
          id: 2, 
          name: 'data.csv', 
          type: 'data',
          size: 2048,
          modified: new Date().toISOString(),
          path: '/data/data.csv'
        },
        { 
          id: 3, 
          name: 'backup.zip', 
          type: 'backup',
          size: 5120,
          modified: new Date().toISOString(),
          path: '/backups/backup.zip'
        }
      ],
      directories: [
        'uploads',
        'exports', 
        'backups',
        'config',
        'data'
      ],
      totalFiles: 3,
      totalSize: 8192,
      timestamp: new Date().toISOString()
    };
    
    // Convert /api/system to static system.json
    const systemData = {
      status: 'online',
      version: '1.0.0',
      uptime: 86400,
      services: {
        ftp: { status: 'running', port: 21 },
        ssh: { status: 'running', port: 22 },
        web: { status: 'running', port: 80 },
        api: { status: 'running', port: 3000 }
      },
      resources: {
        cpu: 25.5,
        memory: 45.2,
        disk: 67.8
      },
      timestamp: new Date().toISOString()
    };
    
    // Write static API files
    await fs.writeFile(
      path.join(apiDir, 'auth.json'), 
      JSON.stringify(authData, null, 2)
    );
    
    await fs.writeFile(
      path.join(apiDir, 'users.json'), 
      JSON.stringify(usersData, null, 2)
    );
    
    await fs.writeFile(
      path.join(apiDir, 'files.json'), 
      JSON.stringify(filesData, null, 2)
    );
    
    await fs.writeFile(
      path.join(apiDir, 'system.json'), 
      JSON.stringify(systemData, null, 2)
    );
    
    // Create client-side authentication module
    const clientAuthModule = `
// Client-side authentication for static API
class StaticAuth {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.sessionTimeout = 3600 * 1000; // 1 hour
    this.loginAttempts = 0;
    this.maxAttempts = 3;
  }
  
  async login(credentials) {
    try {
      // Simulate API call to static auth.json
      const response = await fetch('/docssitetemplate/admin/api/auth.json');
      const authConfig = await response.json();
      
      // Client-side validation (in real implementation, this would be server-side)
      if (credentials.username === 'admin' && credentials.password === 'secret') {
        this.isAuthenticated = true;
        this.user = { 
          username: 'admin', 
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin']
        };
        
        // Store session
        localStorage.setItem('auth_token', 'static_token_' + Date.now());
        localStorage.setItem('auth_user', JSON.stringify(this.user));
        localStorage.setItem('auth_expires', Date.now() + this.sessionTimeout);
        
        this.loginAttempts = 0;
        return { success: true, user: this.user };
      } else {
        this.loginAttempts++;
        return { 
          success: false, 
          error: 'Invalid credentials',
          attemptsRemaining: this.maxAttempts - this.loginAttempts
        };
      }
    } catch (error) {
      return { success: false, error: 'Authentication service unavailable' };
    }
  }
  
  async logout() {
    this.isAuthenticated = false;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');
    return { success: true };
  }
  
  checkAuth() {
    const token = localStorage.getItem('auth_token');
    const expires = localStorage.getItem('auth_expires');
    const user = localStorage.getItem('auth_user');
    
    if (token && expires && user && Date.now() < parseInt(expires)) {
      this.isAuthenticated = true;
      this.user = JSON.parse(user);
      return true;
    } else {
      this.isAuthenticated = false;
      this.user = null;
      return false;
    }
  }
  
  async getUsers() {
    if (!this.checkAuth()) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/docssitetemplate/admin/api/users.json');
    return await response.json();
  }
  
  async getFiles() {
    if (!this.checkAuth()) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/docssitetemplate/admin/api/files.json');
    return await response.json();
  }
  
  async getSystemStatus() {
    if (!this.checkAuth()) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/docssitetemplate/admin/api/system.json');
    return await response.json();
  }
}

// Export for use in admin panel
window.StaticAuth = StaticAuth;
`;

    await fs.writeFile(
      path.join(apiDir, 'auth-client.js'),
      clientAuthModule
    );
    
    console.log('✅ Backend conversion completed successfully!');
    console.log('');
    console.log('📁 Generated static API files:');
    console.log('   /admin/api/auth.json');
    console.log('   /admin/api/users.json');
    console.log('   /admin/api/files.json');
    console.log('   /admin/api/system.json');
    console.log('   /admin/api/auth-client.js');
    console.log('');
    console.log('🔐 Client-side authentication ready');
    console.log('   Username: admin');
    console.log('   Password: secret');
    
  } catch (error) {
    console.error('❌ Backend conversion failed:', error.message);
    throw error;
  }
}

// Run the conversion if this script is executed directly
if (require.main === module) {
  convertExpressToStatic();
}

module.exports = convertExpressToStatic;

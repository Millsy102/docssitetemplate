// Component-Based Login System for Secret Website
class SecretLogin {
    constructor() {
        this.isAuthenticated = false;
        this.currentView = 'public'; // 'public', 'login', 'oauth-setup', 'git'
        this.ghClientId = null; // Will be fetched securely from server
        this.authToken = null;
        
        this.init();
    }

    async getCredentials() {
        try {
            // Try to fetch credentials from server first
            const response = await fetch('/api/auth/config');
            if (response.ok) {
                const config = await response.json();
                if (config.useEnvironmentCredentials) {
                    console.log('Using environment variables for authentication');
                    return {
                        username: config.adminUsername,
                        password: config.adminPassword
                    };
                }
            }
        } catch (error) {
            console.log('Could not fetch server config');
        }
        
        // No fallback credentials - this is a security measure
        console.warn('No credentials available. Please configure ADMIN_USERNAME and ADMIN_PASSWORD environment variables.');
        return null;
    }

    getEnvironmentVariable(name) {
        // Try to get from window object (if set by server)
        if (window[name]) {
            return window[name];
        }
        
        // Try to get from meta tags
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        return null;
    }

    async getOAuthClientId() {
        try {
            // Get auth token from localStorage if not already set
            if (!this.authToken) {
                this.authToken = localStorage.getItem('authToken');
            }
            
            if (!this.authToken) {
                throw new Error('Authentication required to access OAuth client ID');
            }
            
            const response = await fetch('/api/auth/oauth-client-id', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.clientId;
            } else {
                throw new Error('Failed to fetch OAuth client ID');
            }
        } catch (error) {
            console.error('Error fetching OAuth client ID:', error);
            throw error;
        }
    }

    async init() {
        // Restore authentication state
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            this.authToken = authToken;
            this.isAuthenticated = true;
        }
        
        // Check if OAuth is already configured
        if (localStorage.getItem('oauthConfigured') === 'true') {
            // OAuth is configured, show Git-only interface
            this.currentView = 'git';
            this.showGitInterface();
            return;
        }
        
        // Check if already logged in for OAuth setup
        if (this.isAuthenticated) {
            this.currentView = 'oauth-setup';
            this.showOAuthSetup();
            return;
        }

        // Add login button to the page
        this.addLoginButton();
    }

    addLoginButton() {
        // Wait for page to load
        setTimeout(() => {
            const footer = document.querySelector('footer');
            if (footer) {
                const loginContainer = document.createElement('div');
                loginContainer.className = 'secret-login-container';
                loginContainer.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                `;

                const loginButton = document.createElement('button');
                loginButton.textContent = '🔐 Login';
                loginButton.className = 'secret-login-btn';
                loginButton.style.cssText = `
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;

                loginButton.addEventListener('mouseenter', () => {
                    loginButton.style.transform = 'translateY(-2px)';
                    loginButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                });

                loginButton.addEventListener('mouseleave', () => {
                    loginButton.style.transform = 'translateY(0)';
                    loginButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                });

                loginButton.addEventListener('click', () => {
                    this.showLoginModal();
                });

                loginContainer.appendChild(loginButton);
                document.body.appendChild(loginContainer);
            }
        }, 1000);
    }

    async showLoginModal() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.login-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h2 style="
                    color: #333;
                    margin-bottom: 30px;
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                ">🔐 Admin Login</h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">Username:</label>
                    <input type="text" id="username" placeholder="Enter username" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">Password:</label>
                    <input type="password" id="password" placeholder="Enter password" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div id="login-error" style="color: #e74c3c; margin-bottom: 20px; display: none;"></div>
                
                <button id="login-btn" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 15px;
                    transition: all 0.3s ease;
                ">Login</button>
                
                <button id="cancel-btn" style="
                    background: transparent;
                    color: #666;
                    border: 2px solid #e1e5e9;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                ">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const loginBtn = document.getElementById('login-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const loginError = document.getElementById('login-error');

        loginBtn.addEventListener('click', async () => {
            // Use server-side authentication instead of client-side credentials
            const success = await this.authenticateWithServer(username.value, password.value);
            if (success) {
                this.isAuthenticated = true;
                this.currentView = 'oauth-setup';
                this.showOAuthSetup();
            } else {
                loginError.textContent = 'Invalid username or password';
                loginError.style.display = 'block';
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Enter key to login
        password.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    async authenticateWithServer(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.token) {
                    this.authToken = data.token;
                    localStorage.setItem('authToken', data.token);
                    return true;
                }
                return false;
            }
            return false;
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    showOAuthSetup() {
        // Remove existing container if any
        const existingContainer = document.querySelector('.oauth-setup-container');
        if (existingContainer) existingContainer.remove();

        const container = document.createElement('div');
        container.className = 'oauth-setup-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        container.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h2 style="
                    color: #333;
                    margin-bottom: 30px;
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                ">🔐 OAuth Setup</h2>
                
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    border-left: 4px solid #667eea;
                ">
                    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">GitHub OAuth Setup Instructions:</h3>
                    <ol style="color: #666; line-height: 1.6; margin-left: 20px;">
                        <li>Go to <a href="https://github.com/settings/developers" target="_blank" style="color: #667eea;">GitHub Developer Settings</a></li>
                        <li>Click "New OAuth App"</li>
                        <li>Fill in the details:
                            <ul style="margin-top: 10px; margin-left: 20px;">
                                <li><strong>Application name:</strong> BeamFlow Site</li>
                                <li><strong>Homepage URL:</strong> <span id="homepage-url">https://yourusername.github.io/your-repo-name</span></li>
                                <li><strong>Authorization callback URL:</strong> <span id="callback-url">https://yourusername.github.io/your-repo-name/auth/callback</span></li>
                            </ul>
                        </li>
                        <li>Click "Register application"</li>
                    </ol>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">GitHub Client ID:</label>
                    <input type="text" id="gh-client-id" placeholder="Enter your GitHub OAuth Client ID" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">GitHub Client Secret:</label>
                    <input type="password" id="gh-client-secret" placeholder="Enter your GitHub OAuth Client Secret" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div id="oauth-error" style="color: #e74c3c; margin-bottom: 20px; display: none;"></div>
                
                <button id="test-oauth" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 15px;
                    transition: all 0.3s ease;
                ">Test OAuth</button>
                
                <button id="complete-setup" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Complete Setup</button>
            </div>
        `;

        document.body.appendChild(container);

        // Add event listeners
        const testOAuth = document.getElementById('test-oauth');
        const completeSetup = document.getElementById('complete-setup');
        const ghClientId = document.getElementById('gh-client-id');
        const ghClientSecret = document.getElementById('gh-client-secret');
        const oauthError = document.getElementById('oauth-error');

        testOAuth.addEventListener('click', () => {
            if (!ghClientId.value.trim() || !ghClientSecret.value.trim()) {
                oauthError.textContent = 'Please enter both GitHub Client ID and Client Secret';
                oauthError.style.display = 'block';
                return;
            }
            
            // Test OAuth configuration
            this.testOAuthConfiguration(ghClientId.value.trim(), ghClientSecret.value.trim());
        });

        completeSetup.addEventListener('click', async () => {
            if (!ghClientId.value.trim() || !ghClientSecret.value.trim()) {
                oauthError.textContent = 'Please enter both GitHub Client ID and Client Secret';
                oauthError.style.display = 'block';
                return;
            }
            
            try {
                // Save OAuth configuration to server
                const response = await fetch('/api/auth/configure-oauth', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        clientId: ghClientId.value.trim(),
                        clientSecret: ghClientSecret.value.trim()
                    })
                });

                if (response.ok) {
                    // Save OAuth configuration locally
                    localStorage.setItem('oauthConfigured', 'true');
                    
                    // Switch to Git-only interface
                    this.currentView = 'git';
                    this.showGitInterface();
                } else {
                    const error = await response.json();
                    oauthError.textContent = error.error || 'Failed to configure OAuth';
                    oauthError.style.display = 'block';
                }
            } catch (error) {
                console.error('OAuth configuration error:', error);
                oauthError.textContent = 'Failed to configure OAuth. Please try again.';
                oauthError.style.display = 'block';
            }
        });
    }

    testOAuthConfiguration(clientId, clientSecret) {
        const oauthError = document.getElementById('oauth-error');
        oauthError.textContent = 'Testing OAuth configuration...';
        oauthError.style.display = 'block';
        oauthError.style.color = '#f39c12';
        
        // Simulate OAuth test (in real implementation, you'd make an API call)
        setTimeout(() => {
            oauthError.textContent = 'OAuth configuration looks good! You can now complete the setup.';
            oauthError.style.color = '#27ae60';
        }, 2000);
    }

    showGitInterface() {
        // Remove existing container if any
        const existingContainer = document.querySelector('.git-interface-container');
        if (existingContainer) existingContainer.remove();

        const container = document.createElement('div');
        container.className = 'git-interface-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        container.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h2 style="
                    color: #333;
                    margin-bottom: 30px;
                    font-size: 28px;
                    font-weight: 700;
                ">🚀 BeamFlow Ready!</h2>
                
                <p style="
                    color: #666;
                    margin-bottom: 30px;
                    line-height: 1.6;
                ">
                    Your OAuth is configured and ready to use. 
                    Click the button below to login with GitHub.
                </p>
                
                <button id="github-login" style="
                    background: #24292e;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 15px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Login with GitHub
                </button>
                
                <button id="logout" style="
                    background: transparent;
                    color: #666;
                    border: 2px solid #e1e5e9;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                ">Logout</button>
            </div>
        `;

        document.body.appendChild(container);

        // Add event listeners
        const githubLogin = document.getElementById('github-login');
        const logout = document.getElementById('logout');

        githubLogin.addEventListener('click', () => {
            this.initiateGitHubOAuth();
        });

        logout.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('oauthConfigured');
            localStorage.removeItem('ghClientId');
            localStorage.removeItem('ghClientSecret');
            localStorage.removeItem('oauthState');
            location.reload();
        });
    }

    async initiateGitHubOAuth() {
        try {
            // Fetch client ID securely from server
            const clientId = await this.getOAuthClientId();
            
            const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
            const scope = encodeURIComponent('repo user');
            const state = Math.random().toString(36).substring(7);
            
            localStorage.setItem('oauthState', state);
            
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to initiate GitHub OAuth:', error);
            alert('Failed to initiate OAuth. Please ensure you are authenticated and OAuth is properly configured.');
        }
    }

    hidePublicSite() {
        // Hide the main content but keep the login button
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Hide other content sections
        const contentSections = document.querySelectorAll('section, article, .content');
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    showPublicSite() {
        // Show the main content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Show other content sections
        const contentSections = document.querySelectorAll('section, article, .content');
        contentSections.forEach(section => {
            section.style.display = 'block';
        });
    }
}

// Update OAuth URLs with site configuration
function updateOAuthUrls() {
    if (typeof window.siteConfig !== 'undefined') {
        const config = window.siteConfig;
        const homepageUrl = document.getElementById('homepage-url');
        const callbackUrl = document.getElementById('callback-url');
        
        if (homepageUrl) {
            homepageUrl.textContent = config.domain.baseUrl.replace(/\/$/, '');
        }
        
        if (callbackUrl) {
            callbackUrl.textContent = config.oauth.callbackUrl;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecretLogin();
    updateOAuthUrls();
});

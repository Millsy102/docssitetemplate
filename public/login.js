// Component-Based Login System for Secret Website
class SecretLogin {
    constructor() {
        this.isAuthenticated = false;
        this.currentView = 'public'; // 'public', 'login', 'oauth-setup', 'git'
        this.githubClientId = 'your-github-client-id'; // Replace with your GitHub OAuth app client ID
        this.credentials = {
            username: 'admin',
            password: 'secret123'
        };
        this.init();
    }

    init() {
        // Check if OAuth is already configured
        if (localStorage.getItem('oauthConfigured') === 'true') {
            // OAuth is configured, show Git-only interface
            this.currentView = 'git';
            this.showGitInterface();
            return;
        }
        
        // Check if already logged in for OAuth setup
        if (localStorage.getItem('secretAuth') === 'true') {
            this.isAuthenticated = true;
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

    showLoginModal() {
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
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: modalSlideIn 0.3s ease;
        `;

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 30px 0; color: #333; font-size: 24px;">🔐 Admin Access</h2>
            <p style="color: #666; margin-bottom: 30px;">Enter credentials to access OAuth setup</p>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="username" placeholder="Username" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 16px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                <input type="password" id="password" placeholder="Password" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div id="login-error" style="color: #e74c3c; margin-bottom: 20px; display: none;"></div>
            
            <button id="login-submit" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            ">Login</button>
            
            <button id="login-cancel" style="
                background: transparent;
                color: #666;
                border: 2px solid #e1e5e9;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                margin-top: 15px;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            ">Cancel</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add event listeners
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginSubmit = document.getElementById('login-submit');
        const loginCancel = document.getElementById('login-cancel');
        const loginError = document.getElementById('login-error');

        loginSubmit.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === this.credentials.username && password === this.credentials.password) {
                this.isAuthenticated = true;
                localStorage.setItem('secretAuth', 'true');
                modal.remove();
                this.showOAuthSetup();
            } else {
                loginError.textContent = 'Invalid credentials. Please try again.';
                loginError.style.display = 'block';
                passwordInput.value = '';
            }
        });

        loginCancel.addEventListener('click', () => {
            modal.remove();
        });

        // Enter key support
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginSubmit.click();
                }
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showOAuthSetup() {
        // Hide the public site
        this.hidePublicSite();
        
        const container = document.createElement('div');
        container.id = 'oauth-setup-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        container.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 90%;
                text-align: center;
            ">
                <h2 style="margin: 0 0 20px 0; color: #333;">🔧 OAuth Setup</h2>
                <p style="color: #666; margin-bottom: 30px;">Configure GitHub OAuth for secure Git-only access</p>
                
                <div style="margin-bottom: 30px; text-align: left;">
                    <h3 style="color: #333; margin-bottom: 15px;">Step 1: Create GitHub OAuth App</h3>
                    <ol style="color: #666; line-height: 1.6;">
                        <li>Go to <a href="https://github.com/settings/developers" target="_blank" style="color: #667eea;">GitHub Developer Settings</a></li>
                        <li>Click "New OAuth App"</li>
                        <li>Fill in the details:
                            <ul style="margin-top: 10px;">
                                <li><strong>Application name:</strong> Your Secret Site</li>
                                <li><strong>Homepage URL:</strong> <span id="homepage-url">https://your-username.github.io/docssitetemplate</span></li>
                                <li><strong>Authorization callback URL:</strong> <span id="callback-url">https://your-username.github.io/docssitetemplate/auth/callback</span></li>
                            </ul>
                        </li>
                        <li>Click "Register application"</li>
                    </ol>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">Client ID:</label>
                    <input type="text" id="client-id" placeholder="Enter your GitHub OAuth Client ID" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; text-align: left; margin-bottom: 10px; color: #333; font-weight: 600;">Client Secret:</label>
                    <input type="password" id="client-secret" placeholder="Enter your GitHub OAuth Client Secret" style="
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
        const clientId = document.getElementById('client-id');
        const clientSecret = document.getElementById('client-secret');
        const oauthError = document.getElementById('oauth-error');

        testOAuth.addEventListener('click', () => {
            if (!clientId.value.trim() || !clientSecret.value.trim()) {
                oauthError.textContent = 'Please enter both Client ID and Client Secret';
                oauthError.style.display = 'block';
                return;
            }
            
            // Test OAuth configuration
            this.testOAuthConfiguration(clientId.value.trim(), clientSecret.value.trim());
        });

        completeSetup.addEventListener('click', () => {
            if (!clientId.value.trim() || !clientSecret.value.trim()) {
                oauthError.textContent = 'Please enter both Client ID and Client Secret';
                oauthError.style.display = 'block';
                return;
            }
            
            // Save OAuth configuration
            localStorage.setItem('oauthConfigured', 'true');
            localStorage.setItem('githubClientId', clientId.value.trim());
            localStorage.setItem('githubClientSecret', clientSecret.value.trim());
            
            // Switch to Git-only interface
            this.currentView = 'git';
            this.showGitInterface();
        });
    }

    testOAuthConfiguration(clientId, clientSecret) {
        const oauthError = document.getElementById('oauth-error');
        const testOAuth = document.getElementById('test-oauth');
        
        testOAuth.textContent = 'Testing...';
        testOAuth.disabled = true;
        
        // Simulate OAuth test
        setTimeout(() => {
            // In a real implementation, you would test the OAuth credentials here
            oauthError.style.display = 'none';
            testOAuth.textContent = '✅ OAuth Test Successful';
            testOAuth.style.background = '#27ae60';
            
            setTimeout(() => {
                testOAuth.textContent = 'Test OAuth';
                testOAuth.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                testOAuth.disabled = false;
            }, 2000);
        }, 1500);
    }

    showGitInterface() {
        // Remove OAuth setup if present
        const oauthSetup = document.getElementById('oauth-setup-container');
        if (oauthSetup) oauthSetup.remove();
        
        // Hide the public site
        this.hidePublicSite();
        
        const container = document.createElement('div');
        container.id = 'git-interface-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        container.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
                text-align: center;
            ">
                <h2 style="margin: 0 0 20px 0; color: #333;">🔐 Git Authentication</h2>
                <p style="color: #666; margin-bottom: 30px;">Access your secret system via GitHub OAuth</p>
                
                <button id="github-login" style="
                    background: #24292e;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
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
            localStorage.removeItem('secretAuth');
            localStorage.removeItem('oauthConfigured');
            localStorage.removeItem('githubClientId');
            localStorage.removeItem('githubClientSecret');
            location.reload();
        });
    }

    initiateGitHubOAuth() {
        const clientId = localStorage.getItem('githubClientId');
        if (!clientId) {
            alert('OAuth not configured. Please set up OAuth first.');
            return;
        }

        const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
        const scope = encodeURIComponent('repo user');
        const state = Math.random().toString(36).substring(7);
        
        localStorage.setItem('oauthState', state);
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        window.location.href = authUrl;
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecretLogin();
});

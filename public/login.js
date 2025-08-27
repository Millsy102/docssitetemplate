// Simple Login System for Secret Website
class SecretLogin {
    constructor() {
        this.isAuthenticated = false;
        this.credentials = {
            username: 'admin',
            password: 'secret123'
        };
        this.init();
    }

    init() {
        // Check if already logged in
        if (localStorage.getItem('secretAuth') === 'true') {
            this.isAuthenticated = true;
            this.showSecretContent();
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
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                    font-size: 14px;
                `;

                loginButton.addEventListener('mouseenter', () => {
                    loginButton.style.transform = 'translateY(-2px)';
                    loginButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                });

                loginButton.addEventListener('mouseleave', () => {
                    loginButton.style.transform = 'translateY(0)';
                    loginButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
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
        // Remove existing modal
        const existingModal = document.querySelector('.secret-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'secret-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: modalSlideIn 0.3s ease;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);

        modalContent.innerHTML = `
            <div style="margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 24px;">🔐</span>
                </div>
                <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Secret Access</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">Enter credentials to access deep scan system</p>
            </div>
            
            <form id="secretLoginForm" style="text-align: left;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 14px;">Username</label>
                    <input type="text" id="secretUsername" style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s ease;" placeholder="Enter username">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 14px;">Password</label>
                    <input type="password" id="secretPassword" style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.3s ease;" placeholder="Enter password">
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Login</button>
                    <button type="button" id="secretCancelBtn" style="flex: 1; background: #f8f9fa; color: #666; border: 2px solid #e1e5e9; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">Cancel</button>
                </div>
            </form>
            
            <div id="secretError" style="margin-top: 15px; color: #e74c3c; font-size: 14px; display: none;"></div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add event listeners
        const form = document.getElementById('secretLoginForm');
        const cancelBtn = document.getElementById('secretCancelBtn');
        const errorDiv = document.getElementById('secretError');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
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

        // Focus on username input
        setTimeout(() => {
            document.getElementById('secretUsername').focus();
        }, 100);
    }

    handleLogin() {
        const username = document.getElementById('secretUsername').value;
        const password = document.getElementById('secretPassword').value;
        const errorDiv = document.getElementById('secretError');

        if (username === this.credentials.username && password === this.credentials.password) {
            this.isAuthenticated = true;
            localStorage.setItem('secretAuth', 'true');
            
            // Remove modal
            const modal = document.querySelector('.secret-modal');
            if (modal) {
                modal.remove();
            }

            // Show success message
            this.showSuccessMessage();
            
            // Start deep scan system
            setTimeout(() => {
                this.showSecretContent();
            }, 2000);
        } else {
            errorDiv.textContent = 'Invalid credentials. Please try again.';
            errorDiv.style.display = 'block';
            
            // Clear password field
            document.getElementById('secretPassword').value = '';
            document.getElementById('secretPassword').focus();
        }
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
            z-index: 10001;
            animation: slideInRight 0.5s ease;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">✅</span>
                <div>
                    <div style="font-weight: 600; margin-bottom: 2px;">Access Granted!</div>
                    <div style="font-size: 12px; opacity: 0.9;">Initializing deep scan system...</div>
                </div>
            </div>
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    showSecretContent() {
        // Remove login button
        const loginContainer = document.querySelector('.secret-login-container');
        if (loginContainer) {
            loginContainer.remove();
        }

        // Create secret dashboard
        const dashboard = document.createElement('div');
        dashboard.className = 'secret-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            min-width: 300px;
            animation: dashboardSlideIn 0.5s ease;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dashboardSlideIn {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        dashboard.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🛡️</span>
                    <h3 style="margin: 0; font-size: 16px;">Deep Scan System</h3>
                </div>
                <button id="secretLogoutBtn" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Logout</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 12px; opacity: 0.8;">System Status</span>
                    <span style="color: #2ecc71; font-size: 12px;">● Active</span>
                </div>
                <div style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="scanProgress" style="background: linear-gradient(90deg, #2ecc71, #27ae60); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 15px;">
                <div>🔍 Scanning: <span id="scanTarget">System files</span></div>
                <div>📊 Progress: <span id="scanPercentage">0%</span></div>
                <div>⏱️ Time: <span id="scanTime">00:00</span></div>
            </div>
            
            <button id="startScanBtn" style="width: 100%; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">Start Deep Scan</button>
        `;

        document.body.appendChild(dashboard);

        // Add event listeners
        document.getElementById('secretLogoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('startScanBtn').addEventListener('click', () => {
            this.startDeepScan();
        });
    }

    startDeepScan() {
        const startBtn = document.getElementById('startScanBtn');
        const progressBar = document.getElementById('scanProgress');
        const scanTarget = document.getElementById('scanTarget');
        const scanPercentage = document.getElementById('scanPercentage');
        const scanTime = document.getElementById('scanTime');

        startBtn.disabled = true;
        startBtn.textContent = 'Scanning...';
        startBtn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';

        const targets = [
            'System files',
            'Network connections',
            'Security protocols',
            'Database systems',
            'User permissions',
            'Encryption keys',
            'Access logs',
            'Configuration files',
            'Backup systems',
            'Firewall rules'
        ];

        let currentTarget = 0;
        let progress = 0;
        let startTime = Date.now();

        const scanInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            progressBar.style.width = progress + '%';
            scanPercentage.textContent = Math.round(progress) + '%';

            // Update target every 10%
            if (Math.floor(progress / 10) > currentTarget && currentTarget < targets.length) {
                currentTarget = Math.floor(progress / 10);
                scanTarget.textContent = targets[currentTarget] || 'Finalizing...';
            }

            // Update time
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            scanTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (progress >= 100) {
                clearInterval(scanInterval);
                this.completeScan();
            }
        }, 200);
    }

    completeScan() {
        const startBtn = document.getElementById('startScanBtn');
        const scanTarget = document.getElementById('scanTarget');

        startBtn.textContent = 'Scan Complete!';
        startBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        scanTarget.textContent = 'All systems secure';

        // Show completion message
        setTimeout(() => {
            this.showScanResults();
        }, 1000);
    }

    showScanResults() {
        const resultsDiv = document.createElement('div');
        resultsDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;

        resultsDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <span style="font-size: 40px;">✅</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #27ae60;">Deep Scan Complete</h2>
            <p style="margin: 0 0 20px 0; color: #666;">All systems have been thoroughly analyzed and secured.</p>
            
            <div style="text-align: left; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>System Files:</span>
                    <span style="color: #27ae60;">✓ Secure</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Network:</span>
                    <span style="color: #27ae60;">✓ Protected</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Database:</span>
                    <span style="color: #27ae60;">✓ Encrypted</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Access Control:</span>
                    <span style="color: #27ae60;">✓ Verified</span>
                </div>
            </div>
            
            <button id="closeResultsBtn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Close</button>
        `;

        document.body.appendChild(resultsDiv);

        document.getElementById('closeResultsBtn').addEventListener('click', () => {
            resultsDiv.remove();
        });

        // Close on outside click
        resultsDiv.addEventListener('click', (e) => {
            if (e.target === resultsDiv) {
                resultsDiv.remove();
            }
        });
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('secretAuth');
        
        // Remove dashboard
        const dashboard = document.querySelector('.secret-dashboard');
        if (dashboard) {
            dashboard.remove();
        }

        // Re-add login button
        this.addLoginButton();
    }
}

// Initialize the secret login system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SecretLogin();
});

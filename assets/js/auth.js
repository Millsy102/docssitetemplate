/**
 * BeamFlow Authentication System
 * Hidden GitHub OAuth integration for accessing the real project
 */

class BeamFlowAuth {
  constructor () {
    this.clientId = 'your-github-client-id'; // Replace with your GitHub OAuth app client ID
    this.redirectUri = window.location.origin + '/auth/callback';
    this.scope = 'read:user';
    this.isAuthenticated = false;
    this.user = null;
    
    this.init();
  }

  init () {
    this.checkAuthStatus();
    this.setupHiddenLogin();
    this.setupAuthCallback();
  }

  setupHiddenLogin () {
    // Create a hidden login button in the footer
    const footer = document.querySelector('footer');
    if (footer) {
      const hiddenLoginBtn = document.createElement('button');
      hiddenLoginBtn.id = 'beamflow-hidden-login';
      hiddenLoginBtn.innerHTML = '🔐';
      hiddenLoginBtn.title = 'Developer Access';
      hiddenLoginBtn.className = 'beamflow-hidden-login';
      
      // Style the hidden button
      const style = document.createElement('style');
      style.textContent = `
        .beamflow-hidden-login {
          position: fixed;
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.3);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 9999;
          opacity: 0.3;
        }
        
        .beamflow-hidden-login:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.1);
        }
        
        .beamflow-hidden-login.authenticated {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
        }
        
        .beamflow-real-project {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          z-index: 10000;
          overflow-y: auto;
        }
        
        .beamflow-real-project.show {
          display: block;
        }
        
        .beamflow-real-header {
          background: #2d2d2d;
          padding: 20px;
          border-bottom: 1px solid #444;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .beamflow-real-content {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .beamflow-real-title {
          font-size: 2.5rem;
          color: #fff;
          margin-bottom: 20px;
        }
        
        .beamflow-real-description {
          font-size: 1.2rem;
          color: #ccc;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        
        .beamflow-real-section {
          background: #2d2d2d;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .beamflow-real-section h3 {
          color: #4CAF50;
          margin-bottom: 15px;
        }
        
        .beamflow-real-section p {
          color: #ccc;
          line-height: 1.6;
        }
        
        .beamflow-logout-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .beamflow-logout-btn:hover {
          background: #d32f2f;
        }
      `;
      document.head.appendChild(style);
      
      hiddenLoginBtn.addEventListener('click', () => {
        this.handleHiddenLogin();
      });
      
      document.body.appendChild(hiddenLoginBtn);
    }
  }

  handleHiddenLogin () {
    if (this.isAuthenticated) {
      this.showRealProject();
    } else {
      this.initiateGitHubAuth();
    }
  }

  initiateGitHubAuth () {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${this.scope}&state=${this.generateState()}`;
    window.location.href = authUrl;
  }

  generateState () {
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('beamflow_auth_state', state);
    return state;
  }

  setupAuthCallback () {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      this.handleAuthCallback(code, state);
    }
  }

  async handleAuthCallback (code, state) {
    const savedState = localStorage.getItem('beamflow_auth_state');
    
    if (state !== savedState) {
      console.error('Invalid state parameter');
      return;
    }
    
    try {
      // In a real implementation, you'd exchange the code for an access token
      // For this demo, we'll simulate the authentication
      this.isAuthenticated = true;
      this.user = {
        login: 'your-github-username',
        name: 'Your Name',
        avatar_url: 'https://github.com/github.png'
      };
      
      localStorage.setItem('beamflow_authenticated', 'true');
      localStorage.setItem('beamflow_user', JSON.stringify(this.user));
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      this.showRealProject();
      
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  checkAuthStatus () {
    const authenticated = localStorage.getItem('beamflow_authenticated');
    const user = localStorage.getItem('beamflow_user');
    
    if (authenticated === 'true' && user) {
      this.isAuthenticated = true;
      this.user = JSON.parse(user);
      this.updateHiddenLoginButton();
    }
  }

  updateHiddenLoginButton () {
    const btn = document.getElementById('beamflow-hidden-login');
    if (btn) {
      btn.classList.add('authenticated');
      btn.innerHTML = '✅';
      btn.title = `Authenticated as ${this.user.login}`;
    }
  }

  showRealProject () {
    // Hide the fake documentation site
    document.body.style.overflow = 'hidden';
    
    // Create the real project overlay
    const realProject = document.createElement('div');
    realProject.className = 'beamflow-real-project show';
    realProject.innerHTML = `
      <div class="beamflow-real-header">
        <h2 style="color: #4CAF50; margin: 0;">🔐 BeamFlow - Real Project</h2>
        <button class="beamflow-logout-btn" onclick="beamflowAuth.logout()">Logout</button>
      </div>
      <div class="beamflow-real-content">
        <h1 class="beamflow-real-title">Welcome to the Real BeamFlow Project</h1>
        <p class="beamflow-real-description">
          This is your actual project that's hidden behind the fake documentation site. 
          Only authenticated users can see this content.
        </p>
        
        <div class="beamflow-real-section">
          <h3>🎯 Project Overview</h3>
          <p>
            This is where your real project documentation, code, and resources live. 
            The public sees a convincing fake documentation site, but you have access 
            to the actual project when authenticated.
          </p>
        </div>
        
        <div class="beamflow-real-section">
          <h3>🔧 Development Setup</h3>
          <p>
            <strong>Local Development:</strong><br>
            • Clone the repository<br>
            • Install dependencies: <code>npm install</code><br>
            • Start development server: <code>npm run dev</code><br>
            • Access at: <code>http://localhost:3000</code>
          </p>
        </div>
        
        <div class="beamflow-real-section">
          <h3>📁 Project Structure</h3>
          <p>
            <strong>Key Directories:</strong><br>
            • <code>/src</code> - Source code<br>
            • <code>/docs</code> - Real documentation<br>
            • <code>/tests</code> - Test files<br>
            • <code>/config</code> - Configuration files<br>
            • <code>/assets</code> - Static assets
          </p>
        </div>
        
        <div class="beamflow-real-section">
          <h3>🚀 Deployment</h3>
          <p>
            <strong>GitHub Pages:</strong><br>
            • The fake site is deployed to GitHub Pages<br>
            • Real project is in a private repository<br>
            • Authentication required for access<br>
            • Automatic deployment on push to main branch
          </p>
        </div>
        
        <div class="beamflow-real-section">
          <h3>🔐 Security Features</h3>
          <p>
            • GitHub OAuth authentication<br>
            • Hidden access point<br>
            • Session management<br>
            • Secure token handling<br>
            • Rate limiting protection
          </p>
        </div>
        
        <div class="beamflow-real-section">
          <h3>📊 Analytics</h3>
          <p>
            • Track fake site visitors<br>
            • Monitor authentication attempts<br>
            • Real project access logs<br>
            • Performance metrics
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(realProject);
  }

  logout () {
    this.isAuthenticated = false;
    this.user = null;
    localStorage.removeItem('beamflow_authenticated');
    localStorage.removeItem('beamflow_user');
    localStorage.removeItem('beamflow_auth_state');
    
    // Remove real project overlay
    const realProject = document.querySelector('.beamflow-real-project');
    if (realProject) {
      realProject.remove();
    }
    
    // Show fake site again
    document.body.style.overflow = '';
    
    // Update hidden login button
    const btn = document.getElementById('beamflow-hidden-login');
    if (btn) {
      btn.classList.remove('authenticated');
      btn.innerHTML = '🔐';
      btn.title = 'Developer Access';
    }
  }
}

// Initialize authentication system
const beamflowAuth = new BeamFlowAuth();

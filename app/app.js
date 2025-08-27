// BeamFlow App Loader
// Loads the existing React application and integrates with desktop agent

import { initializeDesktopAgent } from './agent-client.js';

(async () => {
  const SUPABASE_URL = window.SUPABASE_URL || '___SUPABASE_URL___';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '___SUPABASE_ANON_KEY___';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Re-check auth before booting the private UI
  const { data } = await supabase.auth.getSession();
  if (!data.session) { 
    window.location.replace('/login/'); 
    return; 
  }

  try {
    // Initialize desktop agent
    const agent = await initializeDesktopAgent();
    if (!agent) {
      console.warn('Desktop agent not found. Some features may be limited.');
      // Show a notification to the user about desktop agent
      showDesktopAgentNotification();
    } else {
      console.log('Desktop agent connected successfully');
      // Show success notification
      showDesktopAgentSuccess();
    }

    // Load the existing React application
    await loadExistingApp();

  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load application. Please refresh the page.');
  }
})();

// Load the existing React application
async function loadExistingApp() {
  try {
    // Create a script tag to load the existing app bundle
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/src/main.tsx'; // This will be the built version in production
    
    // For development, we'll load the Vite dev server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      script.src = 'http://localhost:3000/src/main.tsx';
    }
    
    document.head.appendChild(script);
    
    // Wait for the script to load
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    
    console.log('Existing React app loaded successfully');
    
  } catch (error) {
    console.error('Failed to load existing app:', error);
    
    // Fallback: try to load the built version
    try {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '/assets/main.js'; // Built bundle
      document.head.appendChild(fallbackScript);
    } catch (fallbackError) {
      console.error('Fallback loading also failed:', fallbackError);
      throw error;
    }
  }
}

// Show desktop agent notification
function showDesktopAgentNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 16px;
    color: #e5e7eb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></div>
      <strong>Desktop Agent</strong>
    </div>
    <p style="margin: 0 0 12px 0; color: #9ca3af;">Desktop agent not found. Install and start the desktop agent to enable Unreal Engine integration.</p>
    <button onclick="this.parentElement.remove()" style="
      background: #374151;
      border: none;
      color: #e5e7eb;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">Dismiss</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

// Show desktop agent success notification
function showDesktopAgentSuccess() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f2937;
    border: 1px solid #10b981;
    border-radius: 8px;
    padding: 16px;
    color: #e5e7eb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
      <strong>Desktop Agent</strong>
    </div>
    <p style="margin: 0 0 12px 0; color: #9ca3af;">Connected successfully! Unreal Engine integration is now available.</p>
    <button onclick="this.parentElement.remove()" style="
      background: #374151;
      border: none;
      color: #e5e7eb;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">Dismiss</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Show error notification
function showError(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #7f1d1d;
    border: 1px solid #dc2626;
    border-radius: 8px;
    padding: 16px;
    color: #fecaca;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <div style="width: 8px; height: 8px; background: #dc2626; border-radius: 50%;"></div>
      <strong>Error</strong>
    </div>
    <p style="margin: 0 0 12px 0;">${message}</p>
    <button onclick="this.parentElement.remove()" style="
      background: #991b1b;
      border: none;
      color: #fecaca;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">Dismiss</button>
  `;
  
  document.body.appendChild(notification);
}

// Optional: protect fetch calls by attaching supabase auth token when needed
// This can be used by the existing app to make authenticated API calls
window.authenticatedFetch = async (url, options = {}) => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${data.session.access_token}`
    };
  }
  return fetch(url, options);
};

// Expose the desktop agent globally for the existing app to use
window.getDesktopAgent = () => window.DesktopAgent;

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    window.location.replace('/login/');
  }
});

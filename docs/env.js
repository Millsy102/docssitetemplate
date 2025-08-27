// Environment configuration for Supabase
// Replace these placeholders with your actual Supabase credentials
window.SUPABASE_URL = '___SUPABASE_URL___';
window.SUPABASE_ANON_KEY = '___SUPABASE_ANON_KEY___';

// Optional: Set your domain for Desktop Agent allowlist
// window.APP_DOMAIN = 'https://YOUR_DOMAIN';

// Optional: Additional configuration
window.APP_CONFIG = {
    // App name and version
    name: 'BeamFlow',
    version: '1.0.0',
    
    // Feature flags
    features: {
        desktopAgent: true,
        realtimeChat: true,
        analytics: true,
        notifications: true
    },
    
    // API endpoints
    api: {
        baseUrl: window.SUPABASE_URL,
        timeout: 30000
    },
    
    // Desktop Agent configuration
    desktopAgent: {
        port: 31245,
        host: '127.0.0.1',
        reconnectAttempts: 5,
        reconnectDelay: 1000
    }
};

// Validation function to check if environment is properly configured
window.validateEnvironment = function() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => {
        const value = window[key];
        return !value || value.includes('___') || value === '';
    });
    
    if (missing.length > 0) {
        console.error('Missing or invalid environment variables:', missing);
        console.error('Please configure the following in docs/env.js:');
        missing.forEach(key => {
            console.error(`  - ${key}`);
        });
        return false;
    }
    
    return true;
};

// Auto-validate on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (!window.validateEnvironment()) {
            console.warn('Environment validation failed. Some features may not work properly.');
        }
    });
}

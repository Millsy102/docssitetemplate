// BeamFlow Environment Configuration
// Comprehensive configuration for the complete BeamFlow system

// ============================================================================
// CORE CONFIGURATION
// ============================================================================

// Supabase Configuration (Required for authentication)
window.SUPABASE_URL = '___SUPABASE_URL___';
window.SUPABASE_ANON_KEY = '___SUPABASE_ANON_KEY___';

// OAuth Configuration (Determines login method)
window.OAUTH_CONFIG = {
    // OAuth Provider Settings
    google: {
        clientId: '___GOOGLE_OAUTH_CLIENT_ID___',
        clientSecret: '___GOOGLE_OAUTH_CLIENT_SECRET___',
        enabled: false
    },
    github: {
        clientId: '___GITHUB_OAUTH_CLIENT_ID___',
        clientSecret: '___GITHUB_OAUTH_CLIENT_SECRET___',
        enabled: false
    },
    
    // OAuth Status (set to true when OAuth is properly configured)
    isConfigured: false,
    
    // Redirect URLs
    redirectUrl: 'https://millsy102.github.io/docssitetemplate/admin/',
    
    // Admin credentials (for initial setup)
    adminUsername: '___ADMIN_USERNAME___',
    adminPassword: '___ADMIN_PASSWORD___'
};

// GitHub Pages Configuration
window.GITHUB_PAGES_CONFIG = {
    baseUrl: 'https://millsy102.github.io/docssitetemplate',
    repoName: 'docssitetemplate',
    username: 'millsy102'
};

// ============================================================================
// PLUGIN API KEYS AND SECRETS
// ============================================================================

// Analytics & Monitoring
window.ANALYTICS_CONFIG = {
    googleAnalytics: '___GOOGLE_ANALYTICS_ID___',
    mixpanel: '___MIXPANEL_TOKEN___',
    sentry: '___SENTRY_DSN___',
    newRelic: '___NEW_RELIC_LICENSE_KEY___'
};

// Financial Services
window.FINANCIAL_CONFIG = {
    coinGecko: '___COINGECKO_API_KEY___',
    alphaVantage: '___ALPHA_VANTAGE_API_KEY___',
    yahooFinance: '___YAHOO_FINANCE_API_KEY___',
    stripe: '___STRIPE_SECRET_KEY___',
    paypal: '___PAYPAL_CLIENT_ID___'
};

// Security Services
window.SECURITY_CONFIG = {
    haveIBeenPwned: '___HIBP_API_KEY___',
    virusTotal: '___VIRUSTOTAL_API_KEY___',
    shodan: '___SHODAN_API_KEY___',
    abuseIPDB: '___ABUSEIPDB_API_KEY___'
};

// Communication Services
window.COMMUNICATION_CONFIG = {
    twilio: '___TWILIO_ACCOUNT_SID___',
    twilioAuthToken: '___TWILIO_AUTH_TOKEN___',
    sendGrid: '___SENDGRID_API_KEY___',
    mailgun: '___MAILGUN_API_KEY___',
    slack: '___SLACK_BOT_TOKEN___',
    discord: '___DISCORD_BOT_TOKEN___'
};

// Smart Home & IoT
window.SMART_HOME_CONFIG = {
    homeAssistant: '___HOME_ASSISTANT_TOKEN___',
    philipsHue: '___PHILIPS_HUE_BRIDGE_IP___',
    nest: '___NEST_CLIENT_ID___',
    ring: '___RING_REFRESH_TOKEN___',
    tuya: '___TUYA_ACCESS_KEY___'
};

// Development & DevOps
window.DEVELOPMENT_CONFIG = {
    githubToken: '___GITHUB_TOKEN___',
    gitlabToken: '___GITLAB_TOKEN___',
    dockerHub: '___DOCKER_HUB_TOKEN___',
    awsAccessKey: '___AWS_ACCESS_KEY_ID___',
    awsSecretKey: '___AWS_SECRET_ACCESS_KEY___',
    vercelToken: '___VERCEL_TOKEN___',
    netlifyToken: '___NETLIFY_TOKEN___'
};

// File Management & Storage
window.STORAGE_CONFIG = {
    dropbox: '___DROPBOX_ACCESS_TOKEN___',
    googleDrive: '___GOOGLE_DRIVE_API_KEY___',
    oneDrive: '___ONEDRIVE_CLIENT_ID___',
    s3Bucket: '___AWS_S3_BUCKET_NAME___',
    cloudinary: '___CLOUDINARY_CLOUD_NAME___',
    cloudinaryApiKey: '___CLOUDINARY_API_KEY___',
    cloudinaryApiSecret: '___CLOUDINARY_API_SECRET___'
};

// Entertainment & Media
window.ENTERTAINMENT_CONFIG = {
    spotify: '___SPOTIFY_CLIENT_ID___',
    spotifySecret: '___SPOTIFY_CLIENT_SECRET___',
    plex: '___PLEX_TOKEN___',
    jellyfin: '___JELLYFIN_API_KEY___',
    steam: '___STEAM_API_KEY___',
    twitch: '___TWITCH_CLIENT_ID___',
    twitchSecret: '___TWITCH_CLIENT_SECRET___'
};

// Weather & News
window.WEATHER_NEWS_CONFIG = {
    openWeatherMap: '___OPENWEATHERMAP_API_KEY___',
    weatherAPI: '___WEATHERAPI_KEY___',
    newsAPI: '___NEWS_API_KEY___',
    guardian: '___GUARDIAN_API_KEY___',
    reddit: '___REDDIT_CLIENT_ID___',
    redditSecret: '___REDDIT_CLIENT_SECRET___'
};

// AI & Machine Learning
window.AI_CONFIG = {
    openai: '___OPENAI_API_KEY___',
    anthropic: '___ANTHROPIC_API_KEY___',
    huggingFace: '___HUGGINGFACE_API_KEY___',
    replicate: '___REPLICATE_API_TOKEN___',
    stabilityAI: '___STABILITY_AI_API_KEY___',
    cohere: '___COHERE_API_KEY___'
};

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

window.APP_CONFIG = {
    // App name and version
    name: 'BeamFlow',
    version: '1.0.0',
    
    // Feature flags
    features: {
        desktopAgent: true,
        realtimeChat: true,
        analytics: true,
        notifications: true,
        authentication: true,
        pluginSystem: true,
        marketplace: true,
        adminPanel: true
    },
    
    // API endpoints
    api: {
        baseUrl: window.SUPABASE_URL,
        timeout: 30000,
        retryAttempts: 3
    },
    
    // Desktop Agent configuration
    desktopAgent: {
        port: 31245,
        host: '127.0.0.1',
        reconnectAttempts: 5,
        reconnectDelay: 1000
    },
    
    // Authentication configuration
    auth: {
        providers: ['google', 'github'],
        redirectAfterLogin: '/app/',
        redirectAfterLogout: '/',
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // Plugin system configuration
    plugins: {
        autoUpdate: true,
        sandboxMode: true,
        maxConcurrentPlugins: 10,
        pluginTimeout: 30000
    },
    
    // Security configuration
    security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true,
        enableCSRFProtection: true,
        sessionTimeout: 3600000 // 1 hour
    }
};

// ============================================================================
// VALIDATION AND UTILITIES
// ============================================================================

// Validation function to check if environment is properly configured
window.validateEnvironment = function() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => {
        const value = window[key];
        return !value || value.includes('___') || value === '';
    });
    
    if (missing.length > 0) {
        console.error('❌ Missing or invalid environment variables:', missing);
        console.error('Please configure the following:');
        missing.forEach(key => {
            console.error(`  - ${key}`);
        });
        console.error('');
        console.error('For GitHub Pages deployment, set these as GitHub Secrets:');
        console.error('  - SUPABASE_URL');
        console.error('  - SUPABASE_ANON_KEY');
        console.error('');
        console.error('For local development, update docs/env.js directly.');
        return false;
    }
    
    console.log('✅ Environment validation passed');
    return true;
};

// Get configuration for a specific service
window.getServiceConfig = function(serviceName) {
    const configMap = {
        'analytics': window.ANALYTICS_CONFIG,
        'financial': window.FINANCIAL_CONFIG,
        'security': window.SECURITY_CONFIG,
        'communication': window.COMMUNICATION_CONFIG,
        'smart-home': window.SMART_HOME_CONFIG,
        'development': window.DEVELOPMENT_CONFIG,
        'storage': window.STORAGE_CONFIG,
        'entertainment': window.ENTERTAINMENT_CONFIG,
        'weather-news': window.WEATHER_NEWS_CONFIG,
        'ai': window.AI_CONFIG
    };
    
    return configMap[serviceName] || {};
};

// Check if a specific API key is configured
window.isApiKeyConfigured = function(serviceName, keyName) {
    const config = window.getServiceConfig(serviceName);
    const value = config[keyName];
    return value && !value.includes('___') && value !== '';
};

// Get all configured services
window.getConfiguredServices = function() {
    const services = {};
    
    Object.keys(window.ANALYTICS_CONFIG).forEach(key => {
        if (window.isApiKeyConfigured('analytics', key)) {
            if (!services.analytics) services.analytics = [];
            services.analytics.push(key);
        }
    });
    
    Object.keys(window.FINANCIAL_CONFIG).forEach(key => {
        if (window.isApiKeyConfigured('financial', key)) {
            if (!services.financial) services.financial = [];
            services.financial.push(key);
        }
    });
    
    // Add other services...
    ['security', 'communication', 'smart-home', 'development', 'storage', 'entertainment', 'weather-news', 'ai'].forEach(service => {
        const config = window.getServiceConfig(service);
        Object.keys(config).forEach(key => {
            if (window.isApiKeyConfigured(service, key)) {
                if (!services[service]) services[service] = [];
                services[service].push(key);
            }
        });
    });
    
    return services;
};

// Auto-validate on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (!window.validateEnvironment()) {
            console.warn('⚠️ Environment validation failed. Some features may not work properly.');
            
            // Show a user-friendly error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #7f1d1d;
                border: 1px solid #dc2626;
                color: #fecaca;
                padding: 1rem;
                border-radius: 0.5rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                max-width: 300px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            errorDiv.innerHTML = `
                <strong>Configuration Warning</strong><br>
                Some API keys are not configured. Check console for details.
            `;
            document.body.appendChild(errorDiv);
            
            // Remove after 10 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 10000);
        } else {
            console.log('🎉 BeamFlow environment fully configured!');
        }
    });
}

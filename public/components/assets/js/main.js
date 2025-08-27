/* ===== MAIN JAVASCRIPT COMPONENT ===== */

// Import all JavaScript components
import './components/router.js';
import './components/ui.js';
import './components/utils.js';
import './components/api.js';

// Main application initialization
class App {
    constructor() {
        this.initialized = false;
        this.components = new Map();
        this.init();
    }
    
    async init() {
        try {
            console.log('App: Initializing...');
            
            // Initialize core components
            await this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Mark as initialized
            this.initialized = true;
            console.log('App: Initialization complete');
            
            // Dispatch ready event
            this.dispatchEvent('app:ready');
            
        } catch (error) {
            console.error('App: Initialization failed', error);
            this.handleError(error);
        }
    }
    
    async initializeComponents() {
        // Initialize router
        this.components.set('router', new Router());
        
        // Initialize UI manager
        this.components.set('ui', new UIManager());
        
        // Initialize API client
        this.components.set('api', new APIClient());
        
        // Initialize utilities
        this.components.set('utils', new Utils());
        
        // Wait for all components to be ready
        await Promise.all(
            Array.from(this.components.values()).map(component => 
                component.ready ? component.ready() : Promise.resolve()
            )
        );
    }
    
    setupEventListeners() {
        // Handle navigation
        window.addEventListener('popstate', (event) => {
            this.components.get('router').handlePopState(event);
        });
        
        // Handle window resize
        window.addEventListener('resize', (event) => {
            this.components.get('ui').handleResize(event);
        });
        
        // Handle scroll
        window.addEventListener('scroll', (event) => {
            this.components.get('ui').handleScroll(event);
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });
    }
    
    initializeUI() {
        const ui = this.components.get('ui');
        
        // Initialize theme
        ui.initializeTheme();
        
        // Initialize animations
        ui.initializeAnimations();
        
        // Initialize responsive behavior
        ui.initializeResponsive();
    }
    
    handleBeforeUnload(event) {
        // Save any unsaved data
        const router = this.components.get('router');
        if (router.hasUnsavedChanges()) {
            event.preventDefault();
            event.returnValue = '';
        }
    }
    
    handleError(error) {
        console.error('App: Error occurred', error);
        
        // Show error notification
        const ui = this.components.get('ui');
        if (ui) {
            ui.showError('An error occurred. Please try again.');
        }
        
        // Send error to analytics
        if (window.analytics) {
            window.analytics.trackError(error);
        }
    }
    
    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // Public API methods
    getComponent(name) {
        return this.components.get(name);
    }
    
    navigate(path) {
        return this.components.get('router').navigate(path);
    }
    
    showLoading() {
        return this.components.get('ui').showLoading();
    }
    
    hideLoading() {
        return this.components.get('ui').hideLoading();
    }
    
    showNotification(message, type = 'info') {
        return this.components.get('ui').showNotification(message, type);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

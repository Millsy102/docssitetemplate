/* ===== ANALYTICS COMPONENT ===== */

// Google Analytics integration
(function() {
    // Get GA Measurement ID from environment or config
    const getGAMeasurementId = async () => {
        // Check if GA ID is set in window config (set by server)
        if (window.GA_MEASUREMENT_ID) {
            return window.GA_MEASUREMENT_ID;
        }
        
        // Check if GA ID is in meta tag
        const metaTag = document.querySelector('meta[name="ga-measurement-id"]');
        if (metaTag && metaTag.content) {
            return metaTag.content;
        }
        
        // Try to fetch from server config
        try {
            const response = await fetch('/api/analytics/config');
            const config = await response.json();
            if (config.ga_measurement_id && config.analytics_enabled) {
                return config.ga_measurement_id;
            }
        } catch (error) {
            console.warn('Failed to fetch analytics config:', error);
        }
        
        // Return null if no GA ID found
        return null;
    };
    
    // Initialize GA when config is available
    const initializeGA = async () => {
        const gaMeasurementId = await getGAMeasurementId();
    
        // Only load GA if we have a valid measurement ID
        if (gaMeasurementId && gaMeasurementId !== 'your-google-analytics-measurement-id') {
            // Load Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
            document.head.appendChild(script);
            
            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', gaMeasurementId, {
                'page_title': document.title,
                'page_location': window.location.href,
                'custom_map': {
                    'dimension1': 'user_type',
                    'dimension2': 'page_section'
                }
            });
            
            // Make gtag globally available
            window.gtag = gtag;
            
            console.log('Google Analytics initialized with ID:', gaMeasurementId);
        } else {
            console.log('Google Analytics not initialized - no valid measurement ID found');
        }
    };
    
    // Initialize GA when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGA);
    } else {
        initializeGA();
    }
})();

// Custom analytics tracking
class Analytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        // Track page views
        this.trackPageView();
        
        // Track user interactions
        this.trackUserInteractions();
        
        // Track performance metrics
        this.trackPerformance();
        
        // Track errors
        this.trackErrors();
    }
    
    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Track page view
    trackPageView() {
        const pageData = {
            event: 'page_view',
            page_title: document.title,
            page_url: window.location.href,
            page_referrer: document.referrer,
            session_id: this.sessionId,
            timestamp: new Date().toISOString()
        };
        
        this.sendEvent(pageData);
        
        // Track with gtag if available
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: pageData.page_title,
                page_location: pageData.page_url,
                page_referrer: pageData.page_referrer
            });
        }
    }
    
    // Track user interactions
    trackUserInteractions() {
        // Track clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            const clickData = {
                event: 'click',
                element_type: target.tagName.toLowerCase(),
                element_class: target.className,
                element_id: target.id,
                element_text: target.textContent?.substring(0, 50),
                page_url: window.location.href,
                session_id: this.sessionId,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent(clickData);
        });
        
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const formData = {
                event: 'form_submit',
                form_id: form.id,
                form_action: form.action,
                form_method: form.method,
                page_url: window.location.href,
                session_id: this.sessionId,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent(formData);
        });
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track at 25%, 50%, 75%, 100%
                if ([25, 50, 75, 100].includes(maxScroll)) {
                    const scrollData = {
                        event: 'scroll_depth',
                        scroll_percent: maxScroll,
                        page_url: window.location.href,
                        session_id: this.sessionId,
                        timestamp: new Date().toISOString()
                    };
                    
                    this.sendEvent(scrollData);
                }
            }
        });
    }
    
    // Track performance metrics
    trackPerformance() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const performanceData = {
                    event: 'performance',
                    load_time: perfData.loadEventEnd - perfData.loadEventStart,
                    dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    first_paint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
                    first_contentful_paint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime,
                    page_url: window.location.href,
                    session_id: this.sessionId,
                    timestamp: new Date().toISOString()
                };
                
                this.sendEvent(performanceData);
            }, 1000);
        });
    }
    
    // Track errors
    trackErrors() {
        window.addEventListener('error', (event) => {
            const errorData = {
                event: 'error',
                error_message: event.message,
                error_filename: event.filename,
                error_lineno: event.lineno,
                error_colno: event.colno,
                page_url: window.location.href,
                session_id: this.sessionId,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent(errorData);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            const errorData = {
                event: 'unhandled_rejection',
                error_reason: event.reason?.toString(),
                page_url: window.location.href,
                session_id: this.sessionId,
                timestamp: new Date().toISOString()
            };
            
            this.sendEvent(errorData);
        });
    }
    
    // Send event to analytics
    sendEvent(data) {
        // Store locally
        this.events.push(data);
        
        // Send to Google Analytics if available
        if (window.gtag) {
            gtag('event', data.event, {
                event_category: 'user_interaction',
                event_label: data.page_url,
                value: data.load_time || 0,
                custom_parameters: data
            });
        }
        
        // Send to custom analytics endpoint
        this.sendToCustomAnalytics(data);
    }
    
    // Send to custom analytics endpoint
    sendToCustomAnalytics(data) {
        const analyticsEndpoint = '/api/analytics';
        
        fetch(analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        }).then(result => {
            if (result.success) {
                console.log('Analytics event tracked successfully');
            }
        }).catch(error => {
            console.warn('Analytics send failed:', error.message);
            // Store locally if server is unavailable
            this.storeLocalEvent(data);
        });
    }
    
    // Store event locally when server is unavailable
    storeLocalEvent(data) {
        try {
            const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            localEvents.push({
                ...data,
                stored_at: new Date().toISOString()
            });
            
            // Keep only last 50 events
            if (localEvents.length > 50) {
                localEvents.splice(0, localEvents.length - 50);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(localEvents));
        } catch (error) {
            console.warn('Failed to store analytics event locally:', error);
        }
    }
    
    // Get session summary
    getSessionSummary() {
        const sessionDuration = Date.now() - this.startTime;
        const eventCount = this.events.length;
        
        return {
            session_id: this.sessionId,
            session_duration: sessionDuration,
            event_count: eventCount,
            events: this.events
        };
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new Analytics();
});

// Send session data before page unload
window.addEventListener('beforeunload', () => {
    if (window.analytics) {
        const summary = window.analytics.getSessionSummary();
        
        // Try to send session summary using beacon API
        try {
            const success = navigator.sendBeacon('/api/analytics/session', JSON.stringify(summary));
            if (!success) {
                // Fallback to localStorage if beacon fails
                window.analytics.storeLocalEvent({
                    event: 'session_summary',
                    ...summary
                });
            }
        } catch (error) {
            console.warn('Failed to send session data:', error);
            // Store locally as fallback
            window.analytics.storeLocalEvent({
                event: 'session_summary',
                ...summary
            });
        }
    }
});

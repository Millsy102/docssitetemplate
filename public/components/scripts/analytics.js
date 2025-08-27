/* ===== ANALYTICS COMPONENT ===== */

// Google Analytics integration
(function() {
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID', {
        'page_title': document.title,
        'page_location': window.location.href,
        'custom_map': {
            'dimension1': 'user_type',
            'dimension2': 'page_section'
        }
    });
    
    // Make gtag globally available
    window.gtag = gtag;
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
        // Replace with your analytics endpoint
        const analyticsEndpoint = '/api/analytics';
        
        fetch(analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(error => {
            console.warn('Analytics send failed:', error);
        });
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
        
        // Send session summary
        navigator.sendBeacon('/api/analytics/session', JSON.stringify(summary));
    }
});

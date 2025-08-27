/* ===== PERFORMANCE MONITORING COMPONENT ===== */

// Performance monitoring and optimization
window.addEventListener('load', () => {
    setTimeout(() => {
        // Performance metrics collection
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
        const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
        const firstContentfulPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
        
        console.log('Performance Metrics:', {
            'Page Load Time': `${loadTime}ms`,
            'DOM Content Loaded': `${domContentLoaded}ms`,
            'First Paint': firstPaint ? `${firstPaint.startTime}ms` : 'N/A',
            'First Contentful Paint': firstContentfulPaint ? `${firstContentfulPaint.startTime}ms` : 'N/A'
        });
        
        // Performance budget checking
        checkPerformanceBudget(loadTime, firstContentfulPaint?.startTime);
        
        // Hide loading screen
        hideLoadingScreen();
        
    }, 1000);
});

// Check performance budget
function checkPerformanceBudget(loadTime, fcp) {
    const budget = {
        loadTime: 3000, // 3 seconds
        fcp: 1500 // 1.5 seconds
    };
    
    if (loadTime > budget.loadTime) {
        console.warn(`Performance Warning: Load time (${loadTime}ms) exceeds budget (${budget.loadTime}ms)`);
    }
    
    if (fcp && fcp > budget.fcp) {
        console.warn(`Performance Warning: FCP (${fcp}ms) exceeds budget (${budget.fcp}ms)`);
    }
}

// Hide loading screen with animation
function hideLoadingScreen() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.visibility = 'hidden';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

// Intersection Observer for animations
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.addEventListener('DOMContentLoaded', () => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    });
}

// Resource loading optimization
function optimizeResourceLoading() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Memory management
function cleanupMemory() {
    // Clear any stored data that's no longer needed
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        console.log('Memory Usage:', {
            'Used JS Heap Size': `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
            'Total JS Heap Size': `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
            'JS Heap Size Limit': `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
        });
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    optimizeResourceLoading();
    
    // Cleanup memory periodically
    setInterval(cleanupMemory, 30000); // Every 30 seconds
});

// Error tracking
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Send to analytics if needed
    // sendErrorToAnalytics(event);
});

// Unhandled promise rejection tracking
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
    });
    
    // Send to analytics if needed
    // sendErrorToAnalytics(event);
});

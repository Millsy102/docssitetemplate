// Main JavaScript for Documentation Site Template

class DocsSite {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.searchData = [];
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupSearch();
        this.setupProgressBar();
        this.setupAccessibility();
    }

    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Search toggle
        const searchToggle = document.querySelector('.search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', () => this.openSearch());
        }

        // Close search on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });

        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    // Search Functionality
    setupSearch() {
        this.createSearchOverlay();
        this.loadSearchData();
    }

    createSearchOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-modal">
                <div class="search-header">
                    <h3>Search Documentation</h3>
                    <button class="search-close" aria-label="Close search">×</button>
                </div>
                <input type="text" class="search-input" placeholder="Search for topics, guides, or examples..." aria-label="Search">
                <div class="search-results"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close button
        const closeBtn = overlay.querySelector('.search-close');
        closeBtn.addEventListener('click', () => this.closeSearch());

        // Search input
        const searchInput = overlay.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstResult = overlay.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        const overlay = document.querySelector('.search-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            const searchInput = overlay.querySelector('.search-input');
            searchInput.focus();
        }
    }

    closeSearch() {
        const overlay = document.querySelector('.search-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    async loadSearchData() {
        // In a real implementation, this would load from an API or JSON file
        // For now, we'll create some sample data
        this.searchData = [
            {
                title: 'Getting Started',
                url: '/docs/getting-started',
                excerpt: 'Learn the basics and get up and running quickly with our comprehensive getting started guide.',
                category: 'Documentation'
            },
            {
                title: 'Installation Guide',
                url: '/docs/installation',
                excerpt: 'Step-by-step instructions for installing and configuring the development environment.',
                category: 'Documentation'
            },
            {
                title: 'Basic Concepts',
                url: '/docs/basic-concepts',
                excerpt: 'Understanding the fundamental concepts and principles of web development.',
                category: 'Documentation'
            },
            {
                title: 'Your First Project',
                url: '/docs/tutorials/first-project',
                excerpt: 'Create your first project and learn the essential development workflow.',
                category: 'Tutorials'
            },
            {
                title: 'API Reference',
                url: '/docs/api/core',
                excerpt: 'Complete API documentation with examples and usage patterns.',
                category: 'API'
            }
        ];
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.showSearchResults([]);
            return;
        }

        const results = this.searchData.filter(item => {
            const searchText = `${item.title} ${item.excerpt} ${item.category}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        this.showSearchResults(results);
    }

    showSearchResults(results) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result-item" onclick="window.location.href='${result.url}'">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-excerpt">${result.excerpt}</div>
                <div class="search-result-category">${result.category}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
    }

    // Progress Bar
    setupProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // Mobile Menu
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('nav-menu-open');
        }
    }

    // Accessibility
    setupAccessibility() {
        // Skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content ID
        const mainContent = document.querySelector('.site-main');
        if (mainContent) {
            mainContent.id = 'main-content';
        }

        // Keyboard navigation for search results
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const searchResults = document.querySelectorAll('.search-result-item');
                const currentIndex = Array.from(searchResults).findIndex(item => 
                    item === document.activeElement
                );

                if (searchResults.length > 0) {
                    let nextIndex;
                    if (e.key === 'ArrowDown') {
                        nextIndex = currentIndex < searchResults.length - 1 ? currentIndex + 1 : 0;
                    } else {
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : searchResults.length - 1;
                    }
                    searchResults[nextIndex].focus();
                }
            }
        });
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Analytics (placeholder for real implementation)
    trackEvent(eventName, properties = {}) {
        // In a real implementation, this would send data to analytics service
        console.log('Analytics Event:', eventName, properties);
    }
}

// Initialize the site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.docsSite = new DocsSite();
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .content-article');
    animateElements.forEach(el => observer.observe(el));
});

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // In production, this would send to error tracking service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    // In production, this would send to error tracking service
});

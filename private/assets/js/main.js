// ===== BEAMFLOW MAIN JAVASCRIPT =====

class BeamFlowApp {
  constructor () {
    this.currentTheme = 'light';
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init () {
    this.setupTheme();
    this.setupNavigation();
    this.setupScrollAnimations();
    this.setupStatistics();
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupIntersectionObserver();
    this.setupEventListeners();
  }

  // ===== THEME MANAGEMENT =====
  setupTheme () {
    const savedTheme = localStorage.getItem('beamflow-theme') || 'light';
    this.setTheme(savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  setTheme (theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('beamflow-theme', theme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  }

  toggleTheme () {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);

    // Add animation class
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  }

  // ===== NAVIGATION =====
  setupNavigation () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
      return;
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });

    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // ===== MOBILE MENU =====
  setupMobileMenu () {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (!mobileToggle || !navLinks) {
      return;
    }

    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-active');
      document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('mobile-active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // ===== SCROLL ANIMATIONS =====
  setupScrollAnimations () {
    const animatedElements = document.querySelectorAll('[data-aos]');

    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
    });

    this.animateOnScroll();
  }

  animateOnScroll () {
    const animatedElements = document.querySelectorAll('[data-aos]');

    animatedElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        const animation = element.getAttribute('data-aos');
        const delay = element.getAttribute('data-aos-delay') || 0;

        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          element.classList.add(`animate-${animation}`);
        }, delay);
      }
    });
  }

  // ===== INTERSECTION OBSERVER =====
  setupIntersectionObserver () {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Observe scroll-animate elements
    document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale').forEach(el => {
      observer.observe(el);
    });
  }

  // ===== STATISTICS COUNTER =====
  setupStatistics () {
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (element, target, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        const displayValue = target >= 1000
          ? Math.floor(current).toLocaleString()
          : current.toFixed(1);

        element.textContent = displayValue;
      }, 16);
    };

    // Trigger counter animation when stats come into view
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'));
          animateCounter(entry.target, target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
      statsObserver.observe(stat);
    });
  }

  // ===== SMOOTH SCROLLING =====
  setupSmoothScrolling () {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar

          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ===== EVENT LISTENERS =====
  setupEventListeners () {
    // Scroll event for animations
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.animateOnScroll();
      }

      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    });

    // Resize event
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Preload critical resources
    this.preloadResources();
  }

  handleResize () {
    // Close mobile menu on resize
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth > 768) {
      if (mobileToggle) {
        mobileToggle.classList.remove('active');
      }
      if (navLinks) {
        navLinks.classList.remove('mobile-active');
      }
      document.body.classList.remove('menu-open');
    }
  }

  handleKeyboardShortcuts (e) {
    // Toggle theme with Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      this.toggleTheme();
    }

    // Escape key closes mobile menu
    if (e.key === 'Escape') {
      const mobileToggle = document.getElementById('mobileMenuToggle');
      const navLinks = document.querySelector('.nav-links');

      if (mobileToggle) {
        mobileToggle.classList.remove('active');
      }
      if (navLinks) {
        navLinks.classList.remove('mobile-active');
      }
      document.body.classList.remove('menu-open');
    }
  }

  preloadResources () {
    // Preload critical images
    const criticalImages = [
      'assets/images/hero-bg.jpg',
      'assets/images/logo.svg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// ===== UTILITY FUNCTIONS =====

// Debounce function
function debounce (func, wait, immediate) {
  let timeout;
  return function executedFunction (...args) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func(...args);
    }
  };
}

// Throttle function
function throttle (func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format number with commas
function formatNumber (num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Generate random number between min and max
function randomBetween (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if element is in viewport
function isInViewport (element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Add loading state to button
function setButtonLoading (button, loading = true) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

// Show notification
function showNotification (message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);

  // Manual close
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  });
}

// Copy to clipboard
async function copyToClipboard (text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  } catch (err) {
    showNotification('Failed to copy to clipboard', 'error');
  }
}

// ===== PERFORMANCE OPTIMIZATION =====

// Lazy load images
function setupLazyLoading () {
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

// Service Worker registration
function registerServiceWorker () {
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
}

// ===== ANALYTICS =====

// Track page views
function trackPageView () {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href
    });
  }
}

// Track events
function trackEvent (action, category, label, value) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value
    });
  }
}

// ===== INITIALIZATION =====

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  window.beamFlowApp = new BeamFlowApp();

  // Setup additional features
  setupLazyLoading();
  registerServiceWorker();

  // Track page view
  trackPageView();

  // Add loading class to body
  document.body.classList.add('loaded');

  console.log('🚀 BeamFlow initialized successfully!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.body.classList.add('page-hidden');
  } else {
    document.body.classList.remove('page-hidden');
  }
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
  // Save any unsaved state
  localStorage.setItem('beamflow-last-visit', Date.now().toString());
});

// Export for use in other modules
window.BeamFlowUtils = {
  debounce,
  throttle,
  formatNumber,
  randomBetween,
  isInViewport,
  setButtonLoading,
  showNotification,
  copyToClipboard,
  trackEvent
};

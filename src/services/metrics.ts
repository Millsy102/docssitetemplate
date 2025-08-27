import { io, Socket } from 'socket.io-client';

interface Metrics {
  pageViews: number;
  userInteractions: number;
  errors: number;
  performance: Record<string, number>;
  userAgent: string;
  screenResolution: string;
  timestamp: number;
  [key: string]: any;
}

class MetricsService {
  private socket: Socket | null = null;
  private metrics: Metrics = {
    pageViews: 0,
    userInteractions: 0,
    errors: 0,
    performance: {},
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timestamp: Date.now()
  };
  
  constructor() {
    this.init();
  }

  private init(): void {
    // Track page views
    this.trackPageView();
    
    // Track performance metrics
    this.trackPerformance();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track errors
    this.trackErrors();
    
    // Track navigation
    this.trackNavigation();
  }

  public connectSocket(): void {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
      
      this.socket.on('connect', () => {
        console.log('Metrics service connected to server');
        this.sendMetrics();
      });
      
      this.socket.on('disconnect', () => {
        console.log('Metrics service disconnected from server');
      });
    }
  }

  private trackPageView(): void {
    this.metrics.pageViews++;
    
    // Track page load time
    if (window.performance && (window.performance as any).timing) {
      const timing = (window.performance as any).timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      this.metrics.performance.pageLoadTime = loadTime;
    }
    
    this.sendMetrics();
  }

  private trackPerformance(): void {
    if ('performance' in window) {
      // Track Core Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          // Track Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.performance.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Track First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              this.metrics.performance.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Track Cumulative Layout Shift (CLS)
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            this.metrics.performance.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }
    }
  }

  private trackUserInteractions(): void {
    // Track clicks
    document.addEventListener('click', () => {
      this.metrics.userInteractions++;
      this.sendMetrics();
    });

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.metrics.userInteractions++;
        this.sendMetrics();
      }, 1000);
    });

    // Track form interactions
    document.addEventListener('input', () => {
      this.metrics.userInteractions++;
      this.sendMetrics();
    });
  }

  private trackErrors(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.metrics.errors++;
      this.sendMetrics();
      
      // Also send error details to server
      if (this.socket) {
        this.socket.emit('client_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: (event.error as Error)?.stack,
          timestamp: Date.now()
        });
      }
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors++;
      this.sendMetrics();
      
      if (this.socket) {
        this.socket.emit('client_error', {
          message: 'Unhandled Promise Rejection',
          error: event.reason?.toString(),
          timestamp: Date.now()
        });
      }
    });
  }

  private trackNavigation(): void {
    // Track navigation changes (for SPA)
    let currentPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private sendMetrics(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('client_metrics', {
        ...this.metrics,
        timestamp: Date.now()
      });
    }
  }

  // Custom metric tracking
  public trackCustomMetric(name: string, value: any): void {
    this.metrics[name] = value;
    this.sendMetrics();
  }

  // Track specific user actions
  public trackUserAction(action: string, data: Record<string, any> = {}): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('user_action', {
        action,
        data,
        timestamp: Date.now()
      });
    }
  }

  // Get current metrics
  public getMetrics(): Metrics {
    return { ...this.metrics };
  }

  // Disconnect
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const metricsService = new MetricsService();

export default metricsService;

import { useEffect, useRef } from 'react'

// Performance metrics interface
interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  fmp: number // First Meaningful Paint
  tti: number // Time to Interactive
}

// Performance observer types
interface PerformanceObserverEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
  value?: number
}

// Core Web Vitals thresholds
const CORE_WEB_VITALS_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
}

class FrontendPerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []
  private isInitialized = false

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (this.isInitialized || !window.PerformanceObserver) return

    // First Contentful Paint
    this.observePaint('first-contentful-paint', (entry) => {
      this.metrics.fcp = entry.startTime
      this.reportMetric('FCP', entry.startTime)
    })

    // Largest Contentful Paint
    this.observeLCP()

    // First Input Delay
    this.observeFID()

    // Cumulative Layout Shift
    this.observeCLS()

    // Time to First Byte
    this.observeTTFB()

    this.isInitialized = true
  }

  private observePaint(type: string, callback: (entry: PerformanceObserverEntry) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry as PerformanceObserverEntry)
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error)
    }
  }

  private observeLCP() {
    try {
      let lcpValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        lcpValue = lastEntry.startTime
        this.metrics.lcp = lcpValue
        this.reportMetric('LCP', lcpValue)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP observer not supported:', error)
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.reportMetric('FID', this.metrics.fid)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID observer not supported:', error)
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value
            this.metrics.cls = clsValue
            this.reportMetric('CLS', clsValue)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  private observeTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        this.reportMetric('TTFB', this.metrics.ttfb)
      }
    } catch (error) {
      console.warn('TTFB calculation failed:', error)
    }
  }

  private reportMetric(name: string, value: number) {
    // Send to backend
    this.sendToBackend(name, value)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(` ${name}:`, value, 'ms')
    }

    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('performance-metric', {
      detail: { name, value, timestamp: Date.now() }
    }))
  }

  private async sendToBackend(name: string, value: number) {
    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })
    } catch (error) {
      console.warn('Failed to send performance metric to backend:', error)
    }
  }

  // Public methods
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  public getCoreWebVitalsScore(): { score: number; grade: 'good' | 'needs-improvement' | 'poor' } {
    let score = 0
    let totalMetrics = 0

    Object.entries(this.metrics).forEach(([metric, value]) => {
      const thresholds = CORE_WEB_VITALS_THRESHOLDS[metric as keyof typeof CORE_WEB_VITALS_THRESHOLDS]
      if (thresholds && value !== undefined) {
        totalMetrics++
        if (value <= thresholds.good) {
          score += 1
        } else if (value <= thresholds.poor) {
          score += 0.5
        }
      }
    })

    const finalScore = totalMetrics > 0 ? (score / totalMetrics) * 100 : 0
    
    return {
      score: Math.round(finalScore),
      grade: finalScore >= 90 ? 'good' : finalScore >= 50 ? 'needs-improvement' : 'poor'
    }
  }

  public mark(name: string) {
    performance.mark(name)
  }

  public measure(name: string, startMark: string, endMark?: string) {
    try {
      const measure = performance.measure(name, startMark, endMark)
      this.reportMetric(name, measure.duration)
    } catch (error) {
      console.warn('Failed to measure performance:', error)
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new FrontendPerformanceMonitor()

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const componentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const componentName = componentRef.current?.tagName || 'Unknown'
    
    // Mark component mount
    performanceMonitor.mark(`${componentName}-mount-start`)
    
    return () => {
      // Mark component unmount
      performanceMonitor.mark(`${componentName}-mount-end`)
      performanceMonitor.measure(`${componentName}-mount-time`, `${componentName}-mount-start`, `${componentName}-mount-end`)
    }
  }, [])

  return componentRef
}

// Hook for measuring specific operations
export const usePerformanceMeasure = (operationName: string) => {
  const measureOperation = (operation: () => void | Promise<void>) => {
    const startMark = `${operationName}-start`
    const endMark = `${operationName}-end`
    
    performanceMonitor.mark(startMark)
    
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        performanceMonitor.mark(endMark)
        performanceMonitor.measure(operationName, startMark, endMark)
      })
    } else {
      performanceMonitor.mark(endMark)
      performanceMonitor.measure(operationName, startMark, endMark)
      return result
    }
  }

  return measureOperation
}

// Hook for listening to performance events
export const usePerformanceEvents = (callback: (event: CustomEvent) => void) => {
  useEffect(() => {
    const handlePerformanceEvent = (event: CustomEvent) => {
      callback(event)
    }

    window.addEventListener('performance-metric', handlePerformanceEvent as EventListener)
    
    return () => {
      window.removeEventListener('performance-metric', handlePerformanceEvent as EventListener)
    }
  }, [callback])
}

// Utility function to get performance score
export const getPerformanceScore = () => {
  return performanceMonitor.getCoreWebVitalsScore()
}

// Utility function to get all metrics
export const getPerformanceMetrics = () => {
  return performanceMonitor.getMetrics()
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect()
  })
}

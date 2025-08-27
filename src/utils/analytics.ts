import React from 'react';
import { useCookieConsent } from '../contexts/CookieConsentContext';

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp?: number;
}

// Analytics provider interface
interface AnalyticsProvider {
  initialize: (config: any) => void;
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (page: string) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  isInitialized: () => boolean;
}

// Mock analytics provider for when consent is not given
class MockAnalyticsProvider implements AnalyticsProvider {
  initialize() {
    console.log('Analytics disabled - user has not consented');
  }

  trackEvent() {
    // No-op when analytics is disabled
  }

  trackPageView() {
    // No-op when analytics is disabled
  }

  setUserProperties() {
    // No-op when analytics is disabled
  }

  isInitialized() {
    return false;
  }
}

// Google Analytics 4 provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private initialized = false;
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  initialize() {
    if (typeof window === 'undefined' || this.initialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', this.measurementId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    this.initialized = true;
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('event', event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties,
      });
    }
  }

  trackPageView(page: string) {
    if (!this.initialized) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', this.measurementId, {
        page_path: page,
      });
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;

    const gtag = (window as any).gtag;
    if (gtag) {
      gtag('config', this.measurementId, properties);
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

// Analytics service class
class AnalyticsService {
  private provider: AnalyticsProvider;
  private consent = false;

  constructor(provider: AnalyticsProvider) {
    this.provider = provider;
  }

  setConsent(hasConsent: boolean) {
    this.consent = hasConsent;

    if (hasConsent && !this.provider.isInitialized()) {
      this.provider.initialize({});
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.consent) return;

    this.provider.trackEvent({
      ...event,
      timestamp: Date.now(),
    });
  }

  trackPageView(page: string) {
    if (!this.consent) return;

    this.provider.trackPageView(page);
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.consent) return;

    this.provider.setUserProperties(properties);
  }

  // Convenience methods for common events
  trackButtonClick(buttonName: string, page?: string) {
    this.trackEvent({
      event: 'button_click',
      category: 'engagement',
      action: 'click',
      label: buttonName,
      properties: { page },
    });
  }

  trackFormSubmission(formName: string, success: boolean) {
    this.trackEvent({
      event: 'form_submit',
      category: 'engagement',
      action: 'submit',
      label: formName,
      value: success ? 1 : 0,
    });
  }

  trackDownload(fileName: string, fileType: string) {
    this.trackEvent({
      event: 'file_download',
      category: 'engagement',
      action: 'download',
      label: fileName,
      properties: { file_type: fileType },
    });
  }

  trackSearch(query: string, resultsCount?: number) {
    this.trackEvent({
      event: 'search',
      category: 'engagement',
      action: 'search',
      label: query,
      value: resultsCount,
      properties: { query_length: query.length },
    });
  }
}

// Create analytics service instance
const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const analyticsService = new AnalyticsService(
  measurementId !== 'G-XXXXXXXXXX'
    ? new GoogleAnalyticsProvider(measurementId)
    : new MockAnalyticsProvider()
);

// Hook to use analytics with consent
export const useAnalytics = () => {
  const { consent } = useCookieConsent();

  // Update analytics service consent when it changes
  React.useEffect(() => {
    analyticsService.setConsent(consent.analytics);
  }, [consent.analytics]);

  return analyticsService;
};

// Export the service for direct use
export default analyticsService;

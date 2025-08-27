import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../utils/analytics';

export const usePageTracking = () => {
  const location = useLocation();
  const analytics = useAnalytics();

  useEffect(() => {
    // Track page view when location changes
    analytics.trackPageView(location.pathname);
  }, [location, analytics]);
};

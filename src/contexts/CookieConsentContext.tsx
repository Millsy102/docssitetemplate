import type {
  ReactNode} from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

interface CookieConsentState {
  analytics: boolean;
  necessary: boolean;
  preferences: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsentState;
  hasConsented: boolean;
  showBanner: boolean;
  updateConsent: (newConsent: Partial<CookieConsentState>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  dismissBanner: () => void;
}

const defaultConsent: CookieConsentState = {
  analytics: false,
  necessary: true, // Always true as these are essential
  preferences: false,
  marketing: false,
};

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({
  children,
}) => {
  const [consent, setConsent] = useState<CookieConsentState>(defaultConsent);
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        setHasConsented(true);
      } catch (error) {
        console.warn('Failed to parse saved cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  // Save consent to localStorage whenever it changes
  useEffect(() => {
    if (hasConsented) {
      localStorage.setItem('cookie-consent', JSON.stringify(consent));
    }
  }, [consent, hasConsented]);

  const updateConsent = (newConsent: Partial<CookieConsentState>) => {
    setConsent(prev => ({ ...prev, ...newConsent }));
    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAll = () => {
    setConsent({
      analytics: true,
      necessary: true,
      preferences: true,
      marketing: true,
    });
    setHasConsented(true);
    setShowBanner(false);
  };

  const rejectAll = () => {
    setConsent({
      analytics: false,
      necessary: true, // Always true
      preferences: false,
      marketing: false,
    });
    setHasConsented(true);
    setShowBanner(false);
  };

  const acceptAnalytics = () => {
    updateConsent({ analytics: true });
  };

  const rejectAnalytics = () => {
    updateConsent({ analytics: false });
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const value: CookieConsentContextType = {
    consent,
    hasConsented,
    showBanner,
    updateConsent,
    acceptAll,
    rejectAll,
    acceptAnalytics,
    rejectAnalytics,
    dismissBanner,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider'
    );
  }
  return context;
};

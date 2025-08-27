import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CookieConsentProvider } from '../contexts/CookieConsentContext';
import AnalyticsOptInBanner from '../components/AnalyticsOptInBanner';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <CookieConsentProvider>{component}</CookieConsentProvider>
    </BrowserRouter>
  );
};

describe('AnalyticsOptInBanner', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('renders banner when no consent is given', () => {
    renderWithProviders(<AnalyticsOptInBanner />);

    expect(
      screen.getByText(/We use cookies to improve your experience/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Accept All/)).toBeInTheDocument();
    expect(screen.getByText(/Reject All/)).toBeInTheDocument();
  });

  it('shows details when "Show details" is clicked', () => {
    renderWithProviders(<AnalyticsOptInBanner />);

    const showDetailsButton = screen.getByText('Show details');
    fireEvent.click(showDetailsButton);

    expect(screen.getByText('Cookie Details:')).toBeInTheDocument();
    expect(screen.getByText('Necessary cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics cookies')).toBeInTheDocument();
  });

  it('hides details when "Hide details" is clicked', () => {
    renderWithProviders(<AnalyticsOptInBanner />);

    const showDetailsButton = screen.getByText('Show details');
    fireEvent.click(showDetailsButton);

    const hideDetailsButton = screen.getByText('Hide details');
    fireEvent.click(hideDetailsButton);

    expect(screen.queryByText('Cookie Details:')).not.toBeInTheDocument();
  });

  it('has privacy policy link', () => {
    renderWithProviders(<AnalyticsOptInBanner />);

    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });

  it('applies correct styling classes', () => {
    renderWithProviders(<AnalyticsOptInBanner />);

    const banner = screen
      .getByText(/We use cookies to improve your experience/)
      .closest('div');
    expect(banner).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'z-50',
      'bg-black'
    );
  });
});

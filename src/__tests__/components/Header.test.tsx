import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '../utils/test-utils';
import Header from '../../components/Header';

describe('Header Component', () => {
  beforeEach(() => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // Mobile width
    });
  });

  it('renders header with logo and title', () => {
    render(<Header />);
    
    expect(screen.getByText('BeamFlow')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument(); // Logo
  });

  it('renders desktop navigation links', () => {
    render(<Header />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /installation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contributing/i })).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile menu when button is clicked', async () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    
    // Initially menu should be closed
    expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click to open menu
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    });
    
    // Click to close menu
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });



  it('closes mobile menu when navigation link is clicked', async () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    
    // Open menu
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    });
    
    // Click on a navigation link in the mobile menu specifically
    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
    const mobileHomeLink = within(mobileNav).getByRole('link', { name: /home/i });
    fireEvent.click(mobileHomeLink);
    
    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('closes mobile menu when logo is clicked', async () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    
    // Open menu
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    });
    
    // Click on logo
    const logoLink = screen.getByRole('link', { name: /beamflow/i });
    fireEvent.click(logoLink);
    
    await waitFor(() => {
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('renders mobile menu with correct navigation items', async () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(mobileMenuButton);
    
    await waitFor(() => {
      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();
      
      // Check mobile navigation links within the mobile nav
      expect(within(mobileNav).getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(within(mobileNav).getByRole('link', { name: /installation/i })).toBeInTheDocument();
      expect(within(mobileNav).getByRole('link', { name: /getting started/i })).toBeInTheDocument();
      expect(within(mobileNav).getByRole('link', { name: /contributing/i })).toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('has correct styling classes', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-black', 'border-b', 'border-red-600', 'px-6', 'py-4', 'relative');
    
    const logo = screen.getByText('B');
    expect(logo.closest('div')).toHaveClass('w-8', 'h-8', 'bg-red-600', 'rounded-lg');
  });
});

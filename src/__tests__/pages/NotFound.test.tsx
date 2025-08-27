import React from 'react';
import { render, screen } from '../utils/test-utils';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
  it('renders 404 error number', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders error heading', () => {
    render(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders error description', () => {
    render(<NotFound />);
    expect(screen.getByText(/The page you're looking for doesn't exist or has been moved/)).toBeInTheDocument();
  });

  it('renders go home button', () => {
    render(<NotFound />);
    
    const goHomeButton = screen.getByRole('link', { name: /go home/i });
    expect(goHomeButton).toBeInTheDocument();
    expect(goHomeButton).toHaveAttribute('href', '/');
    expect(goHomeButton).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white', 'font-semibold', 'py-3', 'px-6', 'rounded-lg', 'transition-colors', 'duration-200');
  });

  it('renders alternative pages text', () => {
    render(<NotFound />);
    expect(screen.getByText('Or try one of these pages:')).toBeInTheDocument();
  });

  it('renders alternative navigation links', () => {
    render(<NotFound />);
    
    const installationLink = screen.getByRole('link', { name: /installation/i });
    const gettingStartedLink = screen.getByRole('link', { name: /getting started/i });
    const contributingLink = screen.getByRole('link', { name: /contributing/i });
    
    expect(installationLink).toBeInTheDocument();
    expect(installationLink).toHaveAttribute('href', '/installation');
    expect(installationLink).toHaveClass('text-red-400', 'hover:text-red-300', 'transition-colors');
    
    expect(gettingStartedLink).toBeInTheDocument();
    expect(gettingStartedLink).toHaveAttribute('href', '/getting-started');
    expect(gettingStartedLink).toHaveClass('text-red-400', 'hover:text-red-300', 'transition-colors');
    
    expect(contributingLink).toBeInTheDocument();
    expect(contributingLink).toHaveAttribute('href', '/contributing');
    expect(contributingLink).toHaveClass('text-red-400', 'hover:text-red-300', 'transition-colors');
  });

  it('has correct page structure and styling', () => {
    render(<NotFound />);
    
    const mainContainer = screen.getByText('404').closest('div').parentElement?.parentElement!;
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-black', 'text-white');
  });

  it('has correct content container styling', () => {
    render(<NotFound />);
    
    const contentContainer = screen.getByText('Page Not Found').closest('div').parentElement!;
    expect(contentContainer).toHaveClass('text-center', 'max-w-md', 'mx-auto', 'px-4');
  });

  it('has correct error number styling', () => {
    render(<NotFound />);
    
    const errorNumber = screen.getByText('404');
    expect(errorNumber).toHaveClass('text-6xl', 'font-bold', 'text-red-600', 'mb-4');
  });

  it('has correct error heading styling', () => {
    render(<NotFound />);
    
    const errorHeading = screen.getByText('Page Not Found');
    expect(errorHeading).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
  });

  it('has correct error description styling', () => {
    render(<NotFound />);
    
    const errorDescription = screen.getByText(/The page you're looking for doesn't exist or has been moved/);
    expect(errorDescription).toHaveClass('text-gray-300', 'mb-8');
  });

  it('has correct button container styling', () => {
    render(<NotFound />);
    
    const buttonContainer = screen.getByRole('link', { name: /go home/i }).closest('div');
    expect(buttonContainer).toHaveClass('space-y-4');
  });

  it('has correct alternative pages section styling', () => {
    render(<NotFound />);
    
    const alternativeSection = screen.getByText('Or try one of these pages:').closest('div');
    expect(alternativeSection).toHaveClass('text-sm', 'text-gray-400');
  });

  it('has correct alternative links container styling', () => {
    render(<NotFound />);
    
    const linksContainer = screen.getByText('Installation').closest('div');
    expect(linksContainer).toHaveClass('mt-2', 'space-y-1');
  });

  it('renders all alternative links as block elements', () => {
    render(<NotFound />);
    
    const alternativeLinks = screen.getAllByRole('link', { name: /installation|getting started|contributing/i });
    alternativeLinks.forEach(link => {
      expect(link).toHaveClass('block');
    });
  });

  it('has correct spacing between elements', () => {
    render(<NotFound />);
    
    const mainContent = screen.getByText('404').closest('div');
    expect(mainContent).toHaveClass('mb-8');
    
    const buttonSection = screen.getByRole('link', { name: /go home/i }).closest('div');
    expect(buttonSection).toHaveClass('space-y-4');
    
    const alternativeLinks = screen.getByText('Installation').closest('div');
    expect(alternativeLinks).toHaveClass('space-y-1');
  });

  it('renders all text content correctly', () => {
    render(<NotFound />);
    
    // Check all text content is present
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The page you're looking for doesn't exist or has been moved/)).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.getByText('Or try one of these pages:')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Contributing')).toBeInTheDocument();
  });

  it('has correct accessibility structure', () => {
    render(<NotFound />);
    
    // Check heading hierarchy
    const h1 = screen.getByText('404');
    const h2 = screen.getByText('Page Not Found');
    
    expect(h1.tagName).toBe('H1');
    expect(h2.tagName).toBe('H2');
  });

  it('has correct link accessibility', () => {
    render(<NotFound />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.textContent).toBeTruthy();
    });
  });

  it('has correct responsive design classes', () => {
    render(<NotFound />);
    
    const contentContainer = screen.getByText('Page Not Found').closest('div').parentElement!;
    expect(contentContainer).toHaveClass('max-w-md', 'mx-auto', 'px-4');
  });

  it('has correct color scheme', () => {
    render(<NotFound />);
    
    // Check red theme colors
    const errorNumber = screen.getByText('404');
    expect(errorNumber).toHaveClass('text-red-600');
    
    const goHomeButton = screen.getByRole('link', { name: /go home/i });
    expect(goHomeButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
    
    const alternativeLinks = screen.getAllByRole('link', { name: /installation|getting started|contributing/i });
    alternativeLinks.forEach(link => {
      expect(link).toHaveClass('text-red-400', 'hover:text-red-300');
    });
  });

  it('has correct transition effects', () => {
    render(<NotFound />);
    
    const goHomeButton = screen.getByRole('link', { name: /go home/i });
    expect(goHomeButton).toHaveClass('transition-colors', 'duration-200');
    
    const alternativeLinks = screen.getAllByRole('link', { name: /installation|getting started|contributing/i });
    alternativeLinks.forEach(link => {
      expect(link).toHaveClass('transition-colors');
    });
  });
});

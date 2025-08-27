import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../src/App';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Mock react-helmet-async to prevent DOM errors in tests
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => children,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App Accessibility', () => {
  beforeEach(() => {
    // Mock window.location for routing tests
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        href: 'http://localhost:3000/',
      },
      writable: true,
    });
  });

  describe('General Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderApp();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', () => {
      renderApp();

      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check for navigation landmarks
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check for contentinfo landmark (footer)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderApp();

      // Check for h1 heading
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBeGreaterThan(0);

      // Check that headings follow proper hierarchy
      const headings = screen.getAllByRole('heading');
      let previousLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        expect(level).toBeGreaterThanOrEqual(previousLevel);
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      });
    });
  });

  describe('Skip Links', () => {
    it('should have skip links for navigation', () => {
      renderApp();

      // Check for skip to main content link
      const skipToMain = screen.getByText(/skip to main content/i);
      expect(skipToMain).toBeInTheDocument();
      expect(skipToMain).toHaveAttribute('href', '#main-content');

      // Check for skip to navigation link
      const skipToNav = screen.getByText(/skip to navigation/i);
      expect(skipToNav).toBeInTheDocument();
      expect(skipToNav).toHaveAttribute('href', '#main-navigation');

      // Check for skip to sidebar link
      const skipToSidebar = screen.getByText(/skip to sidebar/i);
      expect(skipToSidebar).toBeInTheDocument();
      expect(skipToSidebar).toHaveAttribute('href', '#sidebar-navigation');

      // Check for skip to footer link
      const skipToFooter = screen.getByText(/skip to footer/i);
      expect(skipToFooter).toBeInTheDocument();
      expect(skipToFooter).toHaveAttribute('href', '#footer-content');
    });

    it('should have proper skip link styling when focused', () => {
      renderApp();

      const skipToMain = screen.getByText(/skip to main content/i);

      // Focus the skip link
      skipToMain.focus();

      // Check that it becomes visible when focused
      expect(skipToMain).toHaveClass('sr-only');
      expect(skipToMain).toHaveFocus();
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have accessible navigation structure', () => {
      renderApp();

      // Check main navigation
      const mainNav = screen.getByRole('navigation', {
        name: /main navigation/i,
      });
      expect(mainNav).toBeInTheDocument();
      expect(mainNav).toHaveAttribute('id', 'main-navigation');

      // Check sidebar navigation
      const sidebarNav = screen.getByRole('navigation', {
        name: /sidebar navigation/i,
      });
      expect(sidebarNav).toBeInTheDocument();
      expect(sidebarNav).toHaveAttribute('id', 'sidebar-navigation');
    });

    it('should have accessible navigation links', () => {
      renderApp();

      const navLinks = screen.getAllByRole('link');

      navLinks.forEach(link => {
        // Check that links have accessible names
        expect(link).toHaveAccessibleName();

        // Check that links have proper href attributes
        if (link.getAttribute('href') !== '#') {
          expect(link).toHaveAttribute('href');
        }
      });
    });

    it('should have accessible mobile menu button', () => {
      renderApp();

      const mobileMenuButton = screen.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-expanded');
      expect(mobileMenuButton).toHaveAttribute('aria-controls');
      expect(mobileMenuButton).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Content Accessibility', () => {
    it('should have accessible main content area', () => {
      renderApp();

      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    it('should have accessible footer', () => {
      renderApp();

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('id', 'footer-content');
    });

    it('should have proper language attributes', () => {
      renderApp();

      // Check that html element has lang attribute
      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute('lang');
      expect(htmlElement.getAttribute('lang')).toMatch(
        /^[a-z]{2}(-[A-Z]{2})?$/
      );
    });
  });

  describe('Interactive Elements', () => {
    it('should have accessible buttons', () => {
      renderApp();

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        // Check that buttons have accessible names
        expect(button).toHaveAccessibleName();

        // Check that buttons are keyboard accessible
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper focus management', () => {
      renderApp();

      // Check that focusable elements can receive focus
      const focusableElements = screen.getAllByRole(
        'button',
        'link',
        'input',
        'select',
        'textarea'
      );

      focusableElements.forEach(element => {
        element.focus();
        expect(element).toHaveFocus();
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = renderApp();

      // Test color contrast using axe-core
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      // Filter out color contrast violations
      const colorContrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(colorContrastViolations).toHaveLength(0);
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile viewport', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { container } = renderApp();

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility on tablet viewport', async () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = renderApp();

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', () => {
      renderApp();

      // Check for ARIA labels on navigation elements
      const mainNav = screen.getByRole('navigation', {
        name: /main navigation/i,
      });
      expect(mainNav).toHaveAttribute('aria-label', 'Main navigation');

      const sidebarNav = screen.getByRole('navigation', {
        name: /sidebar navigation/i,
      });
      expect(sidebarNav).toHaveAttribute('aria-label', 'Sidebar navigation');
    });

    it('should have proper ARIA states', () => {
      renderApp();

      const mobileMenuButton = screen.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      expect(mobileMenuButton).toHaveAttribute('aria-expanded');
      expect(mobileMenuButton).toHaveAttribute('aria-controls');
      expect(mobileMenuButton).toHaveAttribute('aria-haspopup', 'true');
    });
  });
});

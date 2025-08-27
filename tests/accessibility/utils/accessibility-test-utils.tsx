import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Custom render function that includes router context
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Accessibility test utilities
export const accessibilityTestUtils = {
  // Test component for accessibility violations
  testAccessibility: async (component: React.ReactElement) => {
    const { container } = customRender(component);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    return { container, results };
  },

  // Test component with specific rules
  testAccessibilityWithRules: async (
    component: React.ReactElement,
    rules: Record<string, any> = {}
  ) => {
    const { container } = customRender(component);
    const results = await axe(container, { rules });
    expect(results).toHaveNoViolations();
    return { container, results };
  },

  // Test component for specific violations
  testForSpecificViolations: async (
    component: React.ReactElement,
    violationIds: string[]
  ) => {
    const { container } = customRender(component);
    const results = await axe(container);

    const foundViolations = results.violations.filter(violation =>
      violationIds.includes(violation.id)
    );

    expect(foundViolations).toHaveLength(0);
    return { container, results, foundViolations };
  },

  // Test keyboard navigation
  testKeyboardNavigation: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Test that each element can receive focus
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i] as HTMLElement;
      element.focus();
      expect(element).toHaveFocus();
    }

    return { container, focusableElements };
  },

  // Test skip links functionality
  testSkipLinks: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    // Check for skip links
    const skipLinks = container.querySelectorAll('a[href^="#"]');
    const skipLinkTexts = Array.from(skipLinks).map(link => link.textContent);

    // Common skip link texts
    const expectedSkipLinks = [
      'skip to main content',
      'skip to navigation',
      'skip to sidebar',
      'skip to footer',
    ];

    // Check that at least some skip links are present
    const foundSkipLinks = expectedSkipLinks.filter(expected =>
      skipLinkTexts.some(actual =>
        actual?.toLowerCase().includes(expected.toLowerCase())
      )
    );

    expect(foundSkipLinks.length).toBeGreaterThan(0);

    return { container, skipLinks, foundSkipLinks };
  },

  // Test ARIA attributes
  testAriaAttributes: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    // Test for common ARIA attributes
    const ariaTests = [
      {
        selector: 'nav',
        attributes: ['aria-label', 'role'],
      },
      {
        selector: 'button[aria-expanded]',
        attributes: ['aria-expanded', 'aria-controls', 'aria-haspopup'],
      },
      {
        selector: 'main',
        attributes: ['role'],
      },
      {
        selector: 'footer',
        attributes: ['role'],
      },
    ];

    const results = [];

    for (const test of ariaTests) {
      const elements = container.querySelectorAll(test.selector);
      for (const element of elements) {
        const hasAttributes = test.attributes.every(attr =>
          element.hasAttribute(attr)
        );
        results.push({
          selector: test.selector,
          element,
          hasAttributes,
          attributes: test.attributes,
        });
      }
    }

    return { container, results };
  },

  // Test color contrast (basic check)
  testColorContrast: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    // Use axe-core to test color contrast
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    const colorContrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(colorContrastViolations).toHaveLength(0);

    return { container, results, colorContrastViolations };
  },

  // Test responsive accessibility
  testResponsiveAccessibility: async (
    component: React.ReactElement,
    viewports: Array<{ width: number; height: number; name: string }> = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ]
  ) => {
    const results = [];

    for (const viewport of viewports) {
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height,
      });

      const { container } = customRender(component);

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      const axeResults = await axe(container);
      results.push({
        viewport,
        violations: axeResults.violations,
        passes: axeResults.passes,
      });
    }

    // Check that all viewports have no violations
    for (const result of results) {
      expect(result.violations).toHaveLength(0);
    }

    return results;
  },

  // Test heading hierarchy
  testHeadingHierarchy: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(heading => {
      const tagName = heading.tagName.toLowerCase();
      return parseInt(tagName.charAt(1));
    });

    // Check that headings follow proper hierarchy
    let previousLevel = 0;
    for (const level of headingLevels) {
      expect(level).toBeGreaterThanOrEqual(previousLevel);
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }

    return { container, headings, headingLevels };
  },

  // Test semantic HTML structure
  testSemanticStructure: async (component: React.ReactElement) => {
    const { container } = customRender(component);

    const semanticTests = [
      { selector: 'main', role: 'main' },
      { selector: 'nav', role: 'navigation' },
      { selector: 'footer', role: 'contentinfo' },
      { selector: 'header', role: 'banner' },
      { selector: 'aside', role: 'complementary' },
    ];

    const results = [];

    for (const test of semanticTests) {
      const elements = container.querySelectorAll(test.selector);
      for (const element of elements) {
        const hasRole = element.getAttribute('role') === test.role;
        results.push({
          selector: test.selector,
          element,
          hasRole,
          expectedRole: test.role,
        });
      }
    }

    return { container, results };
  },
};

// Export custom render function
export { customRender as render };

// Export axe for direct use
export { axe };

// Export types
export type AccessibilityTestResult = {
  container: HTMLElement;
  results: any;
  violations?: any[];
  passes?: any[];
};

import 'jest-axe/extend-expect';
import { configureAxe } from 'jest-axe';

// Configure axe-core with custom rules and options
export const axe = configureAxe({
  rules: {
    // Disable rules that might be too strict for development
    'color-contrast': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
    'skip-link': { enabled: true },
    bypass: { enabled: true },
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
    'focusable-no-name': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'image-alt': { enabled: true },
    label: { enabled: true },
    'link-name': { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    'meta-viewport': { enabled: true },
    'object-alt': { enabled: true },
    tabindex: { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
  },
  // Set impact levels to test
  impactLevels: ['critical', 'serious', 'moderate'],
  // Set reporter
  reporter: 'v2',
});

// Custom matchers for accessibility testing
expect.extend({
  toHaveNoAccessibilityViolations: (received: any) => {
    const pass = received.violations.length === 0;

    if (pass) {
      return {
        message: () => 'Expected element to have accessibility violations',
        pass: true,
      };
    } else {
      return {
        message: () => {
          const violations = received.violations
            .map((violation: any) => {
              const nodes = violation.nodes
                .map((node: any) => `  - ${node.html}`)
                .join('\n');
              return `${violation.help} (${violation.impact}):\n${nodes}`;
            })
            .join('\n\n');
          return `Expected element to have no accessibility violations, but found:\n\n${violations}`;
        },
        pass: false,
      };
    }
  },

  toHaveAccessibilityViolations: (received: any, expectedCount: number = 1) => {
    const pass = received.violations.length >= expectedCount;

    if (pass) {
      return {
        message: () =>
          `Expected element to have fewer than ${expectedCount} accessibility violations`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected element to have at least ${expectedCount} accessibility violations, but found ${received.violations.length}`,
        pass: false,
      };
    }
  },
});

// Global accessibility test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoAccessibilityViolations(): R;
      toHaveAccessibilityViolations(expectedCount?: number): R;
    }
  }
}

// Mock window.matchMedia for responsive accessibility testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

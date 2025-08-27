# Accessibility Testing Guide

## Overview

This guide covers the comprehensive automated accessibility testing setup for the BeamFlow documentation site. The testing suite includes multiple layers of accessibility validation to ensure WCAG 2.1 AA compliance.

## Testing Layers

### 1. ESLint Accessibility Rules
**Purpose**: Catch accessibility issues during development
**Tools**: `eslint-plugin-jsx-a11y`
**When to run**: During development, in CI/CD pipeline

### 2. Jest Component Tests
**Purpose**: Test individual components for accessibility violations
**Tools**: `jest-axe`, `@testing-library/react`
**When to run**: During development, before commits

### 3. Playwright E2E Tests
**Purpose**: Test full application accessibility across different browsers and viewports
**Tools**: `@axe-core/playwright`, Playwright
**When to run**: In CI/CD pipeline, before deployments

### 4. Lighthouse CI
**Purpose**: Automated accessibility audits with detailed reporting
**Tools**: Lighthouse CI
**When to run**: In CI/CD pipeline, for performance monitoring

## Quick Start

### Running All Accessibility Tests

```bash
# Run all accessibility tests
npm run test:accessibility:all
```

### Running Individual Test Suites

```bash
# ESLint accessibility checks
npm run lint

# Jest component accessibility tests
npm run test:accessibility

# Playwright E2E accessibility tests
npm run test:accessibility:e2e

# Lighthouse accessibility audit
npm run test:accessibility:lighthouse
```

## Detailed Usage

### ESLint Accessibility Rules

The project includes comprehensive ESLint accessibility rules that catch common issues:

```bash
# Run ESLint with accessibility rules
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Key Rules Enabled**:
- `jsx-a11y/alt-text`: Ensures images have alt text
- `jsx-a11y/anchor-is-valid`: Validates anchor tags
- `jsx-a11y/aria-props`: Validates ARIA properties
- `jsx-a11y/heading-has-content`: Ensures headings have content
- `jsx-a11y/no-access-key`: Prevents access key conflicts
- `jsx-a11y/tabindex-no-positive`: Prevents positive tabindex values

### Jest Component Testing

Test individual components for accessibility violations:

```bash
# Run all accessibility component tests
npm run test:accessibility

# Run with watch mode
npm run test:accessibility:watch

# Run with coverage
npm run test:accessibility:coverage
```

**Example Component Test**:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MyComponent from './MyComponent';

expect.extend(toHaveNoViolations);

describe('MyComponent Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading structure', () => {
    render(<MyComponent />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
```

**Using Test Utilities**:

```tsx
import { accessibilityTestUtils } from '../utils/accessibility-test-utils';

describe('MyComponent Accessibility', () => {
  it('should pass all accessibility tests', async () => {
    await accessibilityTestUtils.testAccessibility(<MyComponent />);
  });

  it('should have proper keyboard navigation', async () => {
    await accessibilityTestUtils.testKeyboardNavigation(<MyComponent />);
  });

  it('should have sufficient color contrast', async () => {
    await accessibilityTestUtils.testColorContrast(<MyComponent />);
  });
});
```

### Playwright E2E Testing

Test the full application across different browsers and viewports:

```bash
# Run E2E accessibility tests
npm run test:accessibility:e2e

# Run with headed browser (for debugging)
npm run test:accessibility:e2e:headed
```

**Test Structure**:

```tsx
import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Lighthouse CI

Run automated accessibility audits with detailed reporting:

```bash
# Run full Lighthouse CI audit
npm run test:accessibility:lighthouse

# Collect data only
npm run test:accessibility:lighthouse:collect

# Assert against collected data
npm run test:accessibility:lighthouse:assert
```

**Configuration**: See `lighthouserc.js` for detailed configuration.

## CI/CD Integration

### GitHub Actions Workflow

The project includes a comprehensive GitHub Actions workflow that runs on every push and pull request:

**Workflow Features**:
- Runs on multiple Node.js versions (18.x, 20.x)
- Tests across different browsers
- Generates detailed accessibility reports
- Comments on pull requests with results
- Uploads test artifacts for review

**Workflow Jobs**:
1. **Accessibility Tests**: ESLint, Jest, and Playwright tests
2. **Lighthouse Audit**: Automated accessibility scoring
3. **Report Generation**: Creates comprehensive accessibility report

### Local Development

For local development, you can run individual test suites:

```bash
# Quick accessibility check
npm run lint

# Component testing
npm run test:accessibility

# Full E2E testing (requires dev server)
npm run dev &
npm run test:accessibility:e2e
```

## Test Coverage

### WCAG 2.1 AA Compliance

The testing suite covers all WCAG 2.1 AA requirements:

**Perceivable**:
- Color contrast testing
- Alt text validation
- Text alternatives for non-text content

**Operable**:
- Keyboard navigation testing
- Focus management
- Skip links functionality
- No keyboard traps

**Understandable**:
- Clear navigation
- Consistent layout
- Error identification

**Robust**:
- Cross-browser compatibility
- Screen reader support
- Valid HTML structure

### Specific Test Areas

1. **Skip Links**: Tests for proper skip link implementation
2. **Navigation**: Validates navigation accessibility
3. **Forms**: Tests form accessibility and labeling
4. **Images**: Ensures proper alt text and descriptions
5. **Headings**: Validates heading hierarchy
6. **ARIA**: Tests ARIA attributes and roles
7. **Color Contrast**: Validates sufficient color contrast
8. **Keyboard Navigation**: Tests keyboard accessibility
9. **Mobile Accessibility**: Tests responsive accessibility
10. **Screen Reader Support**: Validates screen reader compatibility

## Debugging Accessibility Issues

### Common Issues and Solutions

1. **Missing Alt Text**:
   ```tsx
   // ❌ Bad
   <img src="image.jpg" />
   
   // ✅ Good
   <img src="image.jpg" alt="Description of image" />
   ```

2. **Invalid ARIA Attributes**:
   ```tsx
   // ❌ Bad
   <button aria-expanded="true" aria-controls="menu">
   
   // ✅ Good
   <button aria-expanded="true" aria-controls="menu" aria-haspopup="true">
   ```

3. **Poor Color Contrast**:
   ```css
   /* ❌ Bad - Low contrast */
   .text { color: #666; }
   
   /* ✅ Good - High contrast */
   .text { color: #333; }
   ```

4. **Missing Focus Indicators**:
   ```css
   /* ❌ Bad - No focus indicator */
   button:focus { outline: none; }
   
   /* ✅ Good - Clear focus indicator */
   button:focus { 
     outline: 2px solid var(--primary-red);
     outline-offset: 2px;
   }
   ```

### Debugging Tools

1. **Browser DevTools**:
   - Chrome: Lighthouse accessibility audit
   - Firefox: Accessibility inspector
   - Safari: Web inspector accessibility panel

2. **Screen Reader Testing**:
   - NVDA (Windows, free)
   - JAWS (Windows, paid)
   - VoiceOver (Mac, built-in)
   - TalkBack (Android, built-in)

3. **Color Contrast Tools**:
   - WebAIM Color Contrast Checker
   - Chrome DevTools color picker
   - Stark (Figma plugin)

## Best Practices

### Development Workflow

1. **Write Accessible Code First**: Use semantic HTML and proper ARIA attributes
2. **Test Early and Often**: Run accessibility tests during development
3. **Use Testing Utilities**: Leverage the provided test utilities
4. **Review Test Results**: Address accessibility issues before committing
5. **Continuous Monitoring**: Use CI/CD to catch regressions

### Code Quality

1. **Semantic HTML**: Use proper HTML elements and structure
2. **ARIA Attributes**: Add ARIA only when necessary
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Maintain logical focus order
5. **Color and Contrast**: Use sufficient color contrast ratios

### Testing Strategy

1. **Automated Testing**: Use tools to catch common issues
2. **Manual Testing**: Test with actual assistive technologies
3. **User Testing**: Include users with disabilities in testing
4. **Regular Audits**: Conduct periodic accessibility audits
5. **Documentation**: Keep accessibility documentation updated

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Playwright](https://playwright.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Windows, free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, paid)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (Mac, built-in)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android, built-in)

---

*This accessibility testing setup ensures the BeamFlow documentation site meets WCAG 2.1 AA standards and provides an excellent experience for all users, regardless of their abilities or assistive technology needs.*

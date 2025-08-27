import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Home Page Accessibility', () => {
    test('should have no accessibility violations on home page', async ({
      page,
    }) => {
      // Run axe-core accessibility audit
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Check for violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper document structure', async ({ page }) => {
      // Check for main landmark
      await expect(page.locator('main')).toBeVisible();

      // Check for navigation landmarks
      await expect(page.locator('nav')).toBeVisible();

      // Check for contentinfo landmark (footer)
      await expect(page.locator('footer')).toBeVisible();

      // Check for proper heading hierarchy
      const h1Elements = page.locator('h1');
      await expect(h1Elements).toHaveCount(1);
    });

    test('should have accessible skip links', async ({ page }) => {
      // Check for skip links
      await expect(page.getByText('Skip to main content')).toBeVisible();
      await expect(page.getByText('Skip to navigation')).toBeVisible();
      await expect(page.getByText('Skip to sidebar')).toBeVisible();
      await expect(page.getByText('Skip to footer')).toBeVisible();

      // Test skip link functionality
      await page.keyboard.press('Tab');
      await expect(page.getByText('Skip to main content')).toBeFocused();

      // Test skip to main content
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    });

    test('should have accessible navigation', async ({ page }) => {
      // Check main navigation
      const mainNav = page.locator('nav[aria-label="Main navigation"]');
      await expect(mainNav).toBeVisible();

      // Check sidebar navigation
      const sidebarNav = page.locator('nav[aria-label="Sidebar navigation"]');
      await expect(sidebarNav).toBeVisible();

      // Check navigation links
      const navLinks = page.locator('nav a');
      const linkCount = await navLinks.count();

      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        await expect(link).toHaveAttribute('href');
        await expect(link).toBeVisible();
      }
    });

    test('should have accessible mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check mobile menu button
      const mobileMenuButton = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuButton).toBeVisible();
      await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(mobileMenuButton).toHaveAttribute('aria-haspopup', 'true');

      // Test mobile menu functionality
      await mobileMenuButton.click();
      await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');

      // Test escape key closes menu
      await page.keyboard.press('Escape');
      await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.getByText('Skip to main content')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByText('Skip to navigation')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByText('Skip to sidebar')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByText('Skip to footer')).toBeFocused();
    });

    test('should have visible focus indicators', async ({ page }) => {
      // Focus on interactive elements and check for focus indicators
      const focusableElements = page.locator(
        'button, a, input, select, textarea'
      );
      const elementCount = await focusableElements.count();

      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = focusableElements.nth(i);
        await element.focus();

        // Check that element has focus
        await expect(element).toBeFocused();

        // Check for focus indicator (outline or box-shadow)
        const hasFocusIndicator = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return (
            style.outline !== 'none' ||
            style.boxShadow !== 'none' ||
            style.borderColor !== 'transparent'
          );
        });

        expect(hasFocusIndicator).toBe(true);
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      // Run axe-core with color contrast rules
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .withRules(['color-contrast'])
        .analyze();

      // Filter color contrast violations
      const colorContrastViolations =
        accessibilityScanResults.violations.filter(
          violation => violation.id === 'color-contrast'
        );

      expect(colorContrastViolations).toEqual([]);
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should maintain accessibility on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should maintain accessibility on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      // Check for ARIA labels on navigation
      await expect(
        page.locator('nav[aria-label="Main navigation"]')
      ).toBeVisible();
      await expect(
        page.locator('nav[aria-label="Sidebar navigation"]')
      ).toBeVisible();

      // Check for ARIA states on interactive elements
      const mobileMenuButton = page.getByRole('button', {
        name: /toggle navigation menu/i,
      });
      await expect(mobileMenuButton).toHaveAttribute('aria-expanded');
      await expect(mobileMenuButton).toHaveAttribute('aria-controls');
      await expect(mobileMenuButton).toHaveAttribute('aria-haspopup', 'true');
    });

    test('should have proper language attributes', async ({ page }) => {
      // Check html lang attribute
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('lang');

      const langValue = await htmlElement.getAttribute('lang');
      expect(langValue).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check that headings follow proper hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      let previousLevel = 0;
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));

        expect(level).toBeGreaterThanOrEqual(previousLevel);
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      }
    });
  });

  test.describe('Cross-browser Accessibility', () => {
    test('should maintain accessibility across browsers', async ({
      page,
      browserName,
    }) => {
      // Run accessibility tests on different browsers
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // Log browser-specific results
      console.log(
        `Accessibility violations on ${browserName}:`,
        accessibilityScanResults.violations.length
      );

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load quickly while maintaining accessibility', async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Check that page loads within reasonable time
      expect(loadTime).toBeLessThan(5000);

      // Run accessibility audit
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});

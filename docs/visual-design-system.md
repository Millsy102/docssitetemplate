# Beam Visual Design System

## Overview

The Beam Visual Design System is a comprehensive, modern design system built for the Beam Website System. It provides a complete set of design tokens, components, layouts, and visual effects that ensure consistency, accessibility, and beautiful user experiences across all Beam applications.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Theme System](#theme-system)
3. [Component Library](#component-library)
4. [Layout System](#layout-system)
5. [Visual Effects](#visual-effects)
6. [Animation System](#animation-system)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Usage Guidelines](#usage-guidelines)
10. [Best Practices](#best-practices)

## Design Tokens

### Color Palette

The Beam design system uses a comprehensive color palette with semantic naming:

#### Primary Colors
```css
--primary-50: #eff6ff;   /* Lightest */
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Base */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
--primary-950: #172554;  /* Darkest */
```

#### Semantic Colors
- **Success**: Green variants for positive actions and states
- **Warning**: Orange variants for caution and warnings
- **Error**: Red variants for errors and destructive actions
- **Info**: Cyan variants for informational content

#### Neutral Colors
- **Gray Scale**: 50-950 variants for text, backgrounds, and borders
- **White/Black**: Pure colors for contrast and emphasis

### Typography

#### Font Families
```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
--font-family-serif: Georgia, 'Times New Roman', serif;
```

#### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

#### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### Spacing

The spacing system uses a consistent scale:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-none: 0px;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Theme System

### Theme Variants

The Beam system supports multiple theme variants:

#### Light Theme (Default)
```css
[data-theme="light"] {
  --bg-primary: var(--white);
  --bg-secondary: var(--secondary-50);
  --text-primary: var(--secondary-900);
  --text-secondary: var(--secondary-600);
  --border-primary: var(--secondary-200);
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  --bg-primary: var(--secondary-900);
  --bg-secondary: var(--secondary-800);
  --text-primary: var(--secondary-100);
  --text-secondary: var(--secondary-300);
  --border-primary: var(--secondary-700);
}
```

#### High Contrast Theme
```css
[data-theme="high-contrast"] {
  --bg-primary: var(--black);
  --bg-secondary: var(--secondary-900);
  --text-primary: var(--white);
  --text-secondary: var(--secondary-200);
  --border-primary: var(--secondary-600);
}
```

### Color Schemes

Multiple color schemes are available:

- **Blue** (Default): Professional and trustworthy
- **Green**: Growth and success
- **Purple**: Creative and innovative
- **Orange**: Energy and enthusiasm
- **Red**: Power and urgency

## Component Library

### Buttons

#### Button Variants
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-success">Success Button</button>
<button class="btn btn-warning">Warning Button</button>
<button class="btn btn-error">Error Button</button>
<button class="btn btn-outline">Outline Button</button>
<button class="btn btn-ghost">Ghost Button</button>
```

#### Button Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

#### Button States
```html
<button class="btn btn-primary btn-loading">Loading</button>
<button class="btn btn-primary" disabled>Disabled</button>
```

### Forms

#### Form Elements
```html
<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter your email">
  <div class="form-feedback is-valid">Valid email address</div>
</div>

<div class="form-group">
  <label class="form-label">Message</label>
  <textarea class="form-textarea" placeholder="Enter your message"></textarea>
</div>

<div class="form-group">
  <label class="form-label">Category</label>
  <select class="form-select">
    <option>Select a category</option>
    <option>General</option>
    <option>Support</option>
  </select>
</div>
```

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Card subtitle</p>
  </div>
  <div class="card-body">
    <p>Card content goes here...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

#### Card Variants
```html
<div class="card card-primary">Primary Card</div>
<div class="card card-success">Success Card</div>
<div class="card card-warning">Warning Card</div>
<div class="card card-error">Error Card</div>
```

### Alerts

```html
<div class="alert alert-primary">
  <strong>Info:</strong> This is an informational message.
  <button class="alert-close">&times;</button>
</div>

<div class="alert alert-success">
  <strong>Success:</strong> Operation completed successfully.
</div>

<div class="alert alert-warning">
  <strong>Warning:</strong> Please review your input.
</div>

<div class="alert alert-error">
  <strong>Error:</strong> Something went wrong.
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>

<span class="badge badge-outline badge-primary">Outline</span>
```

### Modals

```html
<div class="modal-backdrop">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here...</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

## Layout System

### Container System

```html
<div class="container">Default Container</div>
<div class="container container-sm">Small Container</div>
<div class="container container-md">Medium Container</div>
<div class="container container-lg">Large Container</div>
<div class="container container-xl">Extra Large Container</div>
<div class="container container-2xl">2XL Container</div>
<div class="container container-fluid">Fluid Container</div>
```

### Grid System

```html
<div class="grid grid-cols-1 gap-4">
  <div>Single Column</div>
</div>

<div class="grid grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<div class="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Flexbox Utilities

```html
<div class="flex items-center justify-between">
  <div>Left Content</div>
  <div>Right Content</div>
</div>

<div class="flex flex-col items-center gap-4">
  <div>Top Content</div>
  <div>Bottom Content</div>
</div>
```

## Visual Effects

### Gradients

```html
<div class="gradient-primary">Primary Gradient</div>
<div class="gradient-secondary">Secondary Gradient</div>
<div class="gradient-rainbow">Rainbow Gradient</div>
<div class="gradient-sunset">Sunset Gradient</div>
<div class="gradient-ocean">Ocean Gradient</div>
```

### Glass Effects

```html
<div class="glass">Glass Effect</div>
<div class="glass-dark">Dark Glass</div>
<div class="glass-primary">Primary Glass</div>
<div class="glass-success">Success Glass</div>
```

### Shadows

```html
<div class="shadow-sm">Small Shadow</div>
<div class="shadow-base">Base Shadow</div>
<div class="shadow-md">Medium Shadow</div>
<div class="shadow-lg">Large Shadow</div>
<div class="shadow-xl">Extra Large Shadow</div>
<div class="shadow-glow">Glow Shadow</div>
```

### Patterns

```html
<div class="pattern-dots">Dots Pattern</div>
<div class="pattern-grid">Grid Pattern</div>
<div class="pattern-diagonal">Diagonal Pattern</div>
<div class="pattern-hexagons">Hexagons Pattern</div>
<div class="pattern-waves">Waves Pattern</div>
```

## Animation System

### Base Animations

```html
<div class="fade-in">Fade In</div>
<div class="fade-out">Fade Out</div>
<div class="slide-in-up">Slide In Up</div>
<div class="slide-in-down">Slide In Down</div>
<div class="slide-in-left">Slide In Left</div>
<div class="slide-in-right">Slide In Right</div>
```

### Hover Animations

```html
<div class="hover-lift">Hover Lift</div>
<div class="hover-scale">Hover Scale</div>
<div class="hover-glow">Hover Glow</div>
```

### Loading Animations

```html
<div class="spinner">Loading Spinner</div>
<div class="spinner spinner-lg">Large Spinner</div>
<div class="pulse">Pulse Animation</div>
<div class="bounce">Bounce Animation</div>
<div class="shimmer">Shimmer Effect</div>
```

### Stagger Animations

```html
<div class="stagger-children">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Responsive Utilities

```html
<div class="hidden md:block">Hidden on mobile, visible on medium+</div>
<div class="block md:hidden">Visible on mobile, hidden on medium+</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">Responsive Grid</div>
```

## Accessibility

### Focus Management

```css
.focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast

```css
@media (prefers-contrast: high) {
  :root {
    --border-primary: var(--secondary-600);
    --border-secondary: var(--secondary-500);
  }
}
```

## Usage Guidelines

### 1. Design Token Usage

Always use design tokens instead of hardcoded values:

```css
/* ✅ Good */
.button {
  background-color: var(--primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

/* ❌ Bad */
.button {
  background-color: #3b82f6;
  padding: 16px;
  border-radius: 8px;
}
```

### 2. Component Composition

Compose components using utility classes:

```html
<!-- ✅ Good -->
<div class="card hover-lift">
  <div class="card-header">
    <h3 class="card-title text-gradient-primary">Title</h3>
  </div>
  <div class="card-body">
    <p class="text-secondary">Content</p>
  </div>
</div>

<!-- ❌ Bad -->
<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px;">
  <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
    <h3 style="color: #3b82f6; margin: 0;">Title</h3>
  </div>
  <div style="padding: 24px;">
    <p style="color: #6b7280;">Content</p>
  </div>
</div>
```

### 3. Theme Switching

Implement theme switching using data attributes:

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Switch color scheme
document.documentElement.setAttribute('data-color-scheme', 'green');
```

### 4. Responsive Design

Use mobile-first responsive design:

```html
<!-- Start with mobile layout -->
<div class="grid grid-cols-1 gap-4">
  <!-- Add responsive breakpoints -->
  <div class="md:grid-cols-2 lg:grid-cols-3">
    <div>Content</div>
  </div>
</div>
```

## Best Practices

### 1. Consistency

- Use the same spacing scale throughout your application
- Maintain consistent typography hierarchy
- Apply consistent color usage for similar elements

### 2. Performance

- Minimize CSS bundle size by using utility classes
- Use CSS custom properties for dynamic theming
- Optimize animations for 60fps performance

### 3. Accessibility

- Ensure sufficient color contrast ratios
- Provide focus indicators for keyboard navigation
- Support reduced motion preferences
- Use semantic HTML elements

### 4. Maintainability

- Document component usage and variations
- Use consistent naming conventions
- Keep design tokens organized and well-documented
- Regular design system audits and updates

### 5. Scalability

- Design components to be composable
- Use flexible layouts that adapt to content
- Plan for future design system evolution
- Consider internationalization needs

## File Structure

```
src/styles/
├── BeamMain.css          # Main stylesheet with imports
├── BeamTheme.css         # Design tokens and theme system
├── BeamComponents.css    # Component library
├── BeamLayout.css        # Layout system and utilities
├── BeamVisual.css        # Visual effects and animations
└── animations.css        # Animation keyframes and utilities
```

## Browser Support

The Beam design system supports:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Getting Started

1. Import the main stylesheet:
```html
<link rel="stylesheet" href="/styles/BeamMain.css">
```

2. Set up theme attributes:
```html
<html data-theme="light" data-color-scheme="blue">
```

3. Use components and utilities in your HTML:
```html
<button class="btn btn-primary hover-lift">Click Me</button>
```

4. Customize themes and components as needed for your application.

## Contributing

When contributing to the design system:

1. Follow the established naming conventions
2. Add comprehensive documentation
3. Include accessibility considerations
4. Test across different browsers and devices
5. Update this documentation for any new features

---

For more information, see the [Beam Website System documentation](../README.md).
